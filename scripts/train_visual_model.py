"""CLI script to train, calibrate, and save the visual behavior model (Model A)."""

import argparse
import logging
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "src"))

from fairproctor.models.visual_behavior_model import VisualModelTrainer

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("fairproctor.scripts.train_visual")


def main() -> int:
    parser = argparse.ArgumentParser(description="Train Visual Behavior Classifier (Model A)")
    parser.add_argument(
        "--version", choices=["v1", "v2"], default="v2",
        help="Model version to train: v2 (leakage-resistant, invariant features) or v1 (legacy full features)"
    )
    args = parser.parse_args()

    if args.version == "v2":
        logger.info("Initializing Visual Behavior Model v2.0.0 (Invariant features, contiguous block split)...")
        trainer = VisualModelTrainer()
        classifier, metadata = trainer.train_and_evaluate(
            use_invariant_features=True,
            split_strategy="contiguous_block",
            model_version="2.0.0"
        )
    else:
        logger.info("Initializing Visual Behavior Model v1.0.0 (Full features, random stratified split)...")
        trainer = VisualModelTrainer()
        classifier, metadata = trainer.train_and_evaluate(
            use_invariant_features=False,
            split_strategy="random_stratified",
            model_version="1.0.0"
        )

    saved_path = classifier.save()
    logger.info(f"Visual model successfully trained and persisted to: {saved_path}")

    logger.info("=== Holdout Test Set Evaluation ===")
    for k, v in metadata["test_metrics"].items():
        logger.info(f"  {k}: {v}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
