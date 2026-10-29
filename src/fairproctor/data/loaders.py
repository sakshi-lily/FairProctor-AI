"""Data loading utilities for FairProctor-AI datasets."""

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import pandas as pd

from fairproctor.config import discover_dataset_paths, find_project_root

logger = logging.getLogger("fairproctor.data.loaders")


@dataclass
class VisualDataset:
    """Container for the Mendeley visual behavior dataset."""
    raw_df: pd.DataFrame
    features_df: pd.DataFrame
    labels: pd.Series
    source_file: Path
    feature_names: List[str]
    is_simulated: bool = True  # Ground-truth note: staged/simulated scenarios


@dataclass
class BehavioralDataset:
    """Container for GitHub assessment event datasets."""
    aggregated_df: pd.DataFrame
    raw_events_df: pd.DataFrame
    source_files: List[Path]


def load_visual_dataset(
    file_path: Optional[Path] = None,
    drop_duplicates: bool = True
) -> VisualDataset:
    """
    Loads and sanitizes the Mendeley visual behaviors dataset.

    Args:
        file_path: Optional direct path to CSV. If None, auto-discovered.
        drop_duplicates: Whether to drop duplicate rows.

    Returns:
        VisualDataset container.
    """
    if file_path is None:
        paths = discover_dataset_paths()
        mendeley_dir = paths.get("mendeley_visual")
        if not mendeley_dir or not mendeley_dir.exists():
            raise FileNotFoundError(
                "Mendeley visual behaviors dataset folder could not be found. "
                "Ensure 'Students suspicious behaviors detection dataset fo...' is present."
            )
        csv_candidates = list(mendeley_dir.glob("*.csv"))
        if not csv_candidates:
            raise FileNotFoundError(f"No CSV file found in {mendeley_dir}")
        file_path = csv_candidates[0]

    logger.info(f"Loading visual behavior dataset from: {file_path}")
    df = pd.read_csv(file_path)

    if "label" not in df.columns:
        raise ValueError(f"Target column 'label' not found in {file_path}. Columns found: {list(df.columns)}")

    if drop_duplicates:
        initial_count = len(df)
        df = df.drop_duplicates().reset_index(drop=True)
        dropped = initial_count - len(df)
        if dropped > 0:
            logger.info(f"Dropped {dropped} duplicate rows from visual dataset.")

    labels = df["label"].astype(int)
    features_df = df.drop(columns=["label"])

    return VisualDataset(
        raw_df=df,
        features_df=features_df,
        labels=labels,
        source_file=file_path,
        feature_names=list(features_df.columns),
        is_simulated=True,
    )


def load_behavioral_datasets(
    dataset_dir: Optional[Path] = None
) -> BehavioralDataset:
    """
    Loads student-level and event-level data from Dataset-main/.

    Args:
        dataset_dir: Optional direct path to Dataset-main. If None, auto-discovered.

    Returns:
        BehavioralDataset container.
    """
    if dataset_dir is None:
        paths = discover_dataset_paths()
        dataset_dir = paths.get("github_events")
        if not dataset_dir or not dataset_dir.exists():
            root = find_project_root()
            candidate = root / "Dataset-main"
            if candidate.exists():
                dataset_dir = candidate
            else:
                raise FileNotFoundError("Dataset-main directory could not be found.")

    logger.info(f"Loading behavioral event datasets from: {dataset_dir}")

    agg_files = sorted(list(dataset_dir.glob("Dataset*.csv")))
    raw_files = sorted(list(dataset_dir.glob("Raw_Dataset*.csv")))

    agg_dfs: List[pd.DataFrame] = []
    for f in agg_files:
        df = pd.read_csv(f)
        df["_source_file"] = f.name
        agg_dfs.append(df)

    raw_dfs: List[pd.DataFrame] = []
    for f in raw_files:
        df = pd.read_csv(f)
        df["_source_file"] = f.name
        raw_dfs.append(df)

    combined_agg = pd.concat(agg_dfs, ignore_index=True) if agg_dfs else pd.DataFrame()
    combined_raw = pd.concat(raw_dfs, ignore_index=True) if raw_dfs else pd.DataFrame()

    return BehavioralDataset(
        aggregated_df=combined_agg,
        raw_events_df=combined_raw,
        source_files=agg_files + raw_files,
    )
