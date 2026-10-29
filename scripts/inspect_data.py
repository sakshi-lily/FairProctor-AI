"""CLI script to discover, inventory, and inspect all datasets in FairProctor-AI."""

import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "src"))

import logging
from fairproctor.data.inspect_datasets import DatasetInspector

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("fairproctor.scripts.inspect_data")


def main() -> int:
    logger.info("Starting FairProctor-AI dataset discovery and inspection...")
    inspector = DatasetInspector(root_dir=PROJECT_ROOT)
    inventory = inspector.run_inventory()

    logger.info(f"Discovered {len(inventory['files'])} data files:")
    for f in inventory["files"]:
        fpath = f.get("file_path", "unknown")
        rows = f.get("rows", 0)
        cols = f.get("columns", 0)
        targets = f.get("candidate_targets", [])
        logger.info(f" - {fpath}: {rows:,} rows, {cols} cols, targets: {targets}")

    json_path = inspector.save_inventory_json()
    md_path = inspector.generate_quality_report_markdown()

    logger.info(f"Successfully generated inventory: {json_path}")
    logger.info(f"Successfully generated report: {md_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
