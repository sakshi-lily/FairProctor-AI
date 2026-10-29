"""FastAPI service implementation for FairProctor-AI."""

import logging
from typing import Any, Dict, Optional

from fairproctor.api.schemas import ScoreSessionRequest, ScoreSessionResponse
from fairproctor.engine.risk_engine import FairProctorEngine

logger = logging.getLogger("fairproctor.api.service")


class FairProctorService:
    """Service layer coordinating engine lifecycle and scoring requests."""

    def __init__(self, engine: Optional[FairProctorEngine] = None):
        self.engine = engine or FairProctorEngine.load()

    def score(self, request: ScoreSessionRequest) -> ScoreSessionResponse:
        """Processes request payload through the FairProctorEngine."""
        data: Dict[str, Any] = {
            "session_id": request.session_id,
            "session_metadata": request.session_metadata,
            "similarity_findings": request.similarity_findings,
        }

        if request.video_observations is not None:
            data["video_observations"] = [f.model_dump() for f in request.video_observations]
        else:
            data["video_observations"] = None

        if request.browser_events is not None:
            data["browser_events"] = request.browser_events.model_dump()
        else:
            data["browser_events"] = None

        if request.environmental_conditions is not None:
            data["environmental_conditions"] = request.environmental_conditions.model_dump()
        else:
            data["environmental_conditions"] = None

        if request.policy is not None:
            data["policy"] = request.policy.model_dump()

        result = self.engine.score_session(data)
        return ScoreSessionResponse(**result.to_dict())


def create_app(engine: Optional[FairProctorEngine] = None):
    """Factory creating a FastAPI app instance with FairProctor routes."""
    import asyncio
    import json

    try:
        from fastapi import FastAPI, HTTPException, Query, Request, status
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.responses import JSONResponse, StreamingResponse
    except ImportError:
        logger.warning("FastAPI not installed. Service will run in library mode.")
        return None

    from fairproctor.api.schemas import (
        CandidateAnswerRequest,
        CandidateEventPayload,
        CandidateEventRecord,
        CandidateStartSessionRequest,
        CandidateSubmitExamRequest,
        CreatePairingRequest,
        CreatePairingResponse,
        MobileEnvironmentCheckSubmitRequest,
        OverviewStatsResponse,
        PairingStatusResponse,
        ReviewDecisionType,
        ReviewPriority,
        ReviewerDecisionRecord,
        ReviewerDecisionRequest,
        SessionDetailResponse,
        SessionListResponse,
    )
    from fairproctor.api.session_store import get_session_store, _utc_now_iso

    app = FastAPI(
        title="FairProctor-AI Integrity Engine API",
        version="2.0.0",
        description=(
            "Privacy-conscious, explainable online examination proctoring decision-support engine. "
            "Guarantees that shared rooms, low bandwidth, and poor lighting do NOT penalize candidates."
        )
    )

    # Enable CORS for local frontend integration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    service = FairProctorService(engine=engine)
    session_store = get_session_store()

    @app.get("/health", tags=["System"])
    @app.get("/api/v1/health", tags=["System"])
    def health_check():
        """Returns service health status and loaded model availability."""
        return {
            "status": "healthy",
            "service": "FairProctor-AI",
            "engine_version": service.engine.version,
            "visual_model_loaded": service.engine.visual_model is not None,
            "behavioral_model_loaded": service.engine.behavioral_model is not None,
        }

    @app.get("/status", tags=["System"])
    @app.get("/api/v1/status", tags=["System"])
    def engine_status():
        """Returns comprehensive model, feature, and fairness policy status."""
        vm = service.engine.visual_model
        bm = service.engine.behavioral_model

        return {
            "status": "ready",
            "engine_version": service.engine.version,
            "visual_model": {
                "version": vm.metadata.get("version", "unknown") if vm else None,
                "model_type": vm.metadata.get("model_type", "unknown") if vm else None,
                "feature_count": len(vm.feature_names) if vm else 0,
                "features": vm.feature_names if vm else [],
                "split_strategy": vm.metadata.get("split_strategy", "unknown") if vm else None,
                "invariant_features_enabled": vm.metadata.get("feature_set") == "invariant_behavioral" if vm else False,
            },
            "behavioral_model": {
                "loaded": bm is not None,
                "feature_count": len(bm.feature_names) if bm else 0,
                "features": bm.feature_names if bm else [],
            },
            "supported_modalities": [
                "video_cv",
                "browser_telemetry",
                "environmental_quality",
                "answer_similarity"
            ],
            "fairness_safeguards": [
                "Shared room background persons not penalized (IM-102)",
                "Missing modalities lower confidence without adding risk points",
                "Poor lighting and network disconnects do not inflate risk",
                "Brief head turns and downward scratchpad reading not treated as cheating"
            ]
        }

    @app.get("/api/v1/overview", response_model=OverviewStatsResponse, tags=["Dashboard"])
    def get_overview_statistics():
        """Returns summary metrics and system health for the Reviewer Overview dashboard."""
        return session_store.get_overview_stats()

    @app.get("/api/v1/sessions", response_model=SessionListResponse, tags=["Review Queue"])
    def list_sessions_endpoint(
        search: Optional[str] = Query(None, description="Search session reference or candidate ID"),
        priority: Optional[ReviewPriority] = Query(None, description="Filter by review priority (HIGH, MEDIUM, LOW)"),
        status: Optional[ReviewDecisionType] = Query(None, description="Filter by review status"),
    ):
        """Returns prioritized session review queue with search and filter capabilities."""
        return session_store.list_sessions(search=search, priority=priority, status=status)

    @app.get("/api/v1/sessions/{session_id}", response_model=SessionDetailResponse, tags=["Review Queue"])
    def get_session_detail_endpoint(session_id: str):
        """Returns granular examination session telemetry, evidence timeline, and environmental factors."""
        session = session_store.get_session(session_id)
        if session is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session with reference '{session_id}' not found."
            )
        return session

    @app.post(
        "/api/v1/sessions/{session_id}/decisions",
        response_model=ReviewerDecisionRecord,
        tags=["Reviewer Decisions"],
        summary="Submit human proctor review decision"
    )
    def submit_reviewer_decision(session_id: str, decision_req: ReviewerDecisionRequest):
        """Records a human reviewer action.

        Requires LEAD_PROCTOR role for CONFIRMED_VIOLATION.
        Preserves model predictions untouched.
        """
        try:
            return session_store.record_decision(session_id, decision_req)
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session with reference '{session_id}' not found."
            )
        except PermissionError as pe:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(pe)
            )
        except ValueError as ve:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(ve)
            )

    # -------------------------------------------------------------
    # Candidate Portal & Live Examination Endpoints
    # -------------------------------------------------------------

    @app.post(
        "/api/v1/candidate/sessions/start",
        response_model=SessionDetailResponse,
        tags=["Candidate Examination"],
        summary="Initialize a live mock examination session for candidate"
    )
    def start_candidate_exam_session(req: CandidateStartSessionRequest):
        """Initializes a new candidate exam session, generating pseudonymous reference and initial start event."""
        return session_store.start_candidate_session(req, service.engine)

    @app.get(
        "/api/v1/candidate/sessions/{session_id}",
        response_model=SessionDetailResponse,
        tags=["Candidate Examination"],
        summary="Retrieve candidate session state and progress"
    )
    def get_candidate_session_state(session_id: str):
        """Retrieves session state for an active candidate examination."""
        session = session_store.get_session(session_id)
        if session is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Candidate session '{session_id}' not found."
            )
        return session

    @app.post(
        "/api/v1/candidate/sessions/{session_id}/events",
        response_model=CandidateEventRecord,
        tags=["Candidate Examination"],
        summary="Record a browser or simulation event during candidate exam"
    )
    def record_candidate_exam_event(session_id: str, payload: CandidateEventPayload):
        """Validates and appends a lifecycle event, triggering live risk re-scoring via the engine."""
        try:
            return session_store.record_candidate_event(session_id, payload, service.engine)
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Candidate session '{session_id}' not found."
            )
        except Exception as e:
            logger.error(f"Error recording candidate event: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not record candidate event."
            )

    @app.post(
        "/api/v1/candidate/sessions/{session_id}/answers",
        response_model=CandidateEventRecord,
        tags=["Candidate Examination"],
        summary="Submit an individual question answer"
    )
    def record_candidate_question_answer(session_id: str, req: CandidateAnswerRequest):
        """Submits an answer to a multiple-choice question."""
        try:
            return session_store.record_candidate_answer(session_id, req, service.engine)
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Candidate session '{session_id}' not found."
            )

    @app.post(
        "/api/v1/candidate/sessions/{session_id}/submit",
        response_model=SessionDetailResponse,
        tags=["Candidate Examination"],
        summary="Finalize and submit candidate examination"
    )
    def submit_candidate_exam_endpoint(session_id: str, req: CandidateSubmitExamRequest):
        """Finalizes the candidate examination session, marking status as COMPLETED."""
        try:
            return session_store.submit_candidate_exam(session_id, req, service.engine)
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Candidate session '{session_id}' not found."
            )

    # -------------------------------------------------------------
    # QR-Based Mobile Environment Check Endpoints
    # -------------------------------------------------------------

    @app.post(
        "/api/v1/candidate/sessions/{session_id}/pairing/create",
        response_model=CreatePairingResponse,
        tags=["QR Mobile Pairing"],
        summary="Create a secure, short-lived mobile environment check pairing token"
    )
    def create_pairing_endpoint(
        session_id: str,
        req: Optional[CreatePairingRequest] = None,
    ):
        """Generates a cryptographically secure, short-lived pairing token for mobile environment checks."""
        try:
            origin = req.frontend_origin if req else None
            return session_store.create_pairing(session_id, frontend_origin=origin)
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Candidate session '{session_id}' not found."
            )
        except Exception as e:
            logger.error(f"Error creating pairing token: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not generate mobile pairing token."
            )

    @app.get(
        "/api/v1/candidate/pairing/{pairing_token}",
        response_model=PairingStatusResponse,
        tags=["QR Mobile Pairing"],
        summary="Retrieve current status of a mobile pairing session"
    )
    def get_pairing_status_endpoint(pairing_token: str):
        """Inspects status of a pairing token without exposing student identifiers or credentials."""
        try:
            return session_store.get_pairing_status(pairing_token)
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid or unknown pairing token."
            )

    @app.post(
        "/api/v1/candidate/pairing/{pairing_token}/start",
        response_model=PairingStatusResponse,
        tags=["QR Mobile Pairing"],
        summary="Signal that candidate has scanned QR and started mobile environment check"
    )
    def start_mobile_check_endpoint(pairing_token: str):
        """Transitions mobile pairing to in_progress state upon scan."""
        try:
            return session_store.start_mobile_check(pairing_token, service.engine)
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid or unknown pairing token."
            )
        except ValueError as ve:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(ve)
            )

    @app.post(
        "/api/v1/candidate/pairing/{pairing_token}/submit",
        response_model=PairingStatusResponse,
        tags=["QR Mobile Pairing"],
        summary="Submit structured mobile environment check results"
    )
    def submit_mobile_environment_check_endpoint(
        pairing_token: str,
        req: MobileEnvironmentCheckSubmitRequest,
    ):
        """Validates and records mobile environmental readiness verification."""
        if req.pairing_token != pairing_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Path pairing token does not match payload pairing token."
            )
        try:
            return session_store.submit_mobile_environment_check(req, service.engine)
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid or unknown pairing token."
            )
        except ValueError as ve:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(ve)
            )

    @app.get(
        "/api/v1/candidate/sessions/{session_id}/pairing/status",
        response_model=PairingStatusResponse,
        tags=["QR Mobile Pairing"],
        summary="Poll pairing status by examination session ID"
    )
    def get_session_pairing_status_endpoint(session_id: str):
        """Allows desktop client to query pairing status bound to the active session."""
        try:
            return session_store.get_pairing_status(session_id)
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No active mobile pairing found for session '{session_id}'."
            )

    # -------------------------------------------------------------
    # Real-Time Server-Sent Events (SSE) Streaming
    # -------------------------------------------------------------

    @app.get(
        "/api/v1/events/stream",
        tags=["Live Streaming"],
        summary="Subscribe to live session event stream (SSE)"
    )
    @app.get(
        "/api/v1/sessions/{session_id}/stream",
        tags=["Live Streaming"],
        summary="Subscribe to specific session event stream (SSE)"
    )
    async def sse_event_stream(session_id: Optional[str] = None):
        """Server-Sent Events endpoint streaming real-time examination events to reviewers."""
        async def event_generator():
            q = session_store.subscribe()
            try:
                # Connection established greeting
                yield f"event: connected\ndata: {json.dumps({'status': 'connected', 'timestamp': _utc_now_iso()})}\n\n"
                while True:
                    try:
                        msg = await asyncio.wait_for(q.get(), timeout=15.0)
                        # If filtering for a specific session_id, skip if different
                        if session_id:
                            msg_sid = msg.get("data", {}).get("session_id")
                            if msg_sid and msg_sid != session_id:
                                continue
                        event_name = msg.get("event", "update")
                        data_str = json.dumps(msg.get("data", {}))
                        yield f"event: {event_name}\ndata: {data_str}\n\n"
                    except asyncio.TimeoutError:
                        yield ": keepalive\n\n"
            except asyncio.CancelledError:
                pass
            finally:
                session_store.unsubscribe(q)

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )

    @app.post(
        "/score-session",
        response_model=ScoreSessionResponse,
        tags=["Scoring"],
        summary="Score an examination session across multi-modal evidence"
    )
    @app.post(
        "/score",
        response_model=ScoreSessionResponse,
        tags=["Scoring"],
        include_in_schema=False
    )
    def score_session_endpoint(req: ScoreSessionRequest):
        """Scores an examination session, produces an explainable assessment, and registers in store."""
        try:
            result = service.score(req)
            # Register in reviewer queue
            try:
                session_store.add_scored_session(result.model_dump(), is_demonstration=False)
            except Exception as se:
                logger.warning(f"Could not persist session to in-memory store: {se}")
            return result
        except ValueError as ve:
            logger.warning(f"Validation error in session scoring: {ve}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(ve)
            )
        except Exception as e:
            logger.error(f"Unexpected error scoring session: {type(e).__name__}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An internal error occurred while scoring the session."
            )

    return app

