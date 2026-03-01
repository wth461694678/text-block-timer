#!/usr/bin/env python3
"""Extract table schema summary from XML files — supports multi-project structure.

Usage:
    # Extract for a specific project
    python scripts/extract_schema.py --project nzm

    # Extract for all projects
    python scripts/extract_schema.py --all

    # Legacy mode (backward compatible): reads from data/xml/, writes to references/
    python scripts/extract_schema.py
"""
import xml.etree.ElementTree as ET
import os
import sys
import glob
import argparse
from datetime import datetime

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECTS_DIR = os.path.join(SKILL_DIR, "projects")

# Legacy paths (backward compatible)
LEGACY_XML_DIR = os.path.join(SKILL_DIR, "data", "xml")
LEGACY_OUTPUT = os.path.join(SKILL_DIR, "references", "table_schema_summary.md")


def extract_from_dir(xml_dir, output_path, project_name=None):
    """Extract table schemas from XML files in a directory."""
    xml_files = glob.glob(os.path.join(xml_dir, "*.xml"))
    if not xml_files:
        print(f"No XML files found in {xml_dir}")
        return

    all_tables = []
    for xf in xml_files:
        tree = ET.parse(xf)
        root = tree.getroot()
        fname = os.path.basename(xf)
        for s in root.findall(".//struct"):
            all_tables.append((fname, s))

    title = f"{project_name} TLOG 表结构摘要" if project_name else "TLOG 表结构摘要"

    lines = []
    lines.append(f"# {title}\n\n")
    lines.append(f"> 自动提取时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
    lines.append(f"> 共解析 {len(xml_files)} 个 XML 文件，{len(all_tables)} 张表\n\n")
    lines.append("---\n\n")

    # Table of contents
    lines.append("## 表目录\n\n")
    lines.append("| 序号 | 表名 | 描述 | 字段数 | 来源文件 |\n")
    lines.append("|------|------|------|--------|----------|\n")
    for i, (fname, s) in enumerate(all_tables, 1):
        name = s.get("name", "")
        desc = s.get("desc", "").replace("|", "/")
        cnt = len(s.findall("entry"))
        lines.append(f"| {i} | {name} | {desc} | {cnt} | {fname} |\n")
    lines.append("\n---\n\n")

    # Detailed schema
    lines.append("## 详细表结构\n\n")
    for i, (fname, s) in enumerate(all_tables, 1):
        name = s.get("name", "")
        desc = s.get("desc", "")
        entries = s.findall("entry")
        lines.append(f"### {i}. {name}\n\n")
        lines.append(f"- **描述**: {desc}\n")
        lines.append(f"- **字段数**: {len(entries)}\n")
        lines.append(f"- **来源**: {fname}\n\n")
        lines.append("| 字段名 | 类型 | 描述 |\n")
        lines.append("|--------|------|------|\n")
        for e in entries:
            ename = e.get("name", "")
            etype = e.get("type", "")
            edesc = e.get("desc", "").replace("|", "/")
            lines.append(f"| {ename} | {etype} | {edesc} |\n")
        lines.append("\n---\n\n")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.writelines(lines)
    print(f"Done: {len(all_tables)} tables -> {output_path}")


def extract_project(project_id):
    """Extract schemas for a specific project."""
    project_dir = os.path.join(PROJECTS_DIR, project_id)
    if not os.path.isdir(project_dir):
        print(f"Project '{project_id}' not found in {PROJECTS_DIR}")
        return False

    xml_dir = os.path.join(project_dir, "data", "xml")
    output = os.path.join(project_dir, "table_schema_summary.md")

    if not os.path.isdir(xml_dir):
        print(f"No data/xml/ directory in project '{project_id}'")
        return False

    extract_from_dir(xml_dir, output, project_name=project_id.upper())
    return True


def extract_all_projects():
    """Extract schemas for all projects."""
    if not os.path.isdir(PROJECTS_DIR):
        print(f"Projects directory not found: {PROJECTS_DIR}")
        return

    for name in os.listdir(PROJECTS_DIR):
        project_dir = os.path.join(PROJECTS_DIR, name)
        if os.path.isdir(project_dir):
            print(f"\n--- Processing project: {name} ---")
            extract_project(name)


def main():
    parser = argparse.ArgumentParser(description="Extract table schema from XML files")
    parser.add_argument("--project", "-p", help="Project ID to extract (e.g., nzm)")
    parser.add_argument("--all", "-a", action="store_true", help="Extract for all projects")
    args = parser.parse_args()

    if args.all:
        extract_all_projects()
    elif args.project:
        extract_project(args.project)
    else:
        # Legacy mode: use data/xml/ and references/
        if os.path.isdir(LEGACY_XML_DIR):
            extract_from_dir(LEGACY_XML_DIR, LEGACY_OUTPUT)
        else:
            print("No data/xml/ found. Use --project <id> or --all for multi-project mode.")
            sys.exit(1)


if __name__ == "__main__":
    main()
