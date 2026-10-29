"""CLI script to train and save the student behavioral baseline model (Model B)."""

import logging
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "src"))

from fairproctor.models.session_risk_model import BehavioralModelTrainer

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("fairproctor.scripts.train_behavior")


def main() -> int:
    logger.info("Initializing Behavioral Session Model training...")
    trainer = BehavioralModelTrainer()

    try:
        model, metadata = trainer.train_and_evaluate()
    except Exception as e:
        logger.error(f"Behavioral baseline training failed: {e}", exc_info=True)
        return 1

    saved_path = model.save()
    logger.info(f"Behavioral baseline model persisted to: {saved_path}")

    logger.info(f"Sample Size: {metadata.get('n_samples')} candidates across Dataset1 and Dataset2")
    logger.info("=== Holdout Evaluation Metrics ===")
    for k, v in metadata.get("test_metrics", {}).items():
        logger.info(f"  {k}: {v}")

    logger.info(f"Methodological Notice: {metadata.get('limitations_note')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
