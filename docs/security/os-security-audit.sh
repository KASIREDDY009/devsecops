#!/bin/bash
# =============================================================================
# OS Security Audit Script
# =============================================================================
# Runs three OS-level security tools on the EC2 deployment server:
#   1. Lynis   — System hardening audit
#   2. ClamAV  — Antivirus / malware scan
#   3. chkrootkit — Rootkit detection
#
# Usage: sudo bash os-security-audit.sh
# Output: Results saved to /tmp/security-audit/
#
# MSc Cloud DevOpsSec — Automated Plant Care Monitoring System
# =============================================================================

set -euo pipefail

REPORT_DIR="/tmp/security-audit"
mkdir -p "$REPORT_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "============================================="
echo "  OS Security Audit — $(date)"
echo "============================================="

# ─────────────────────────────────────────────────
# 1. LYNIS — System Hardening Audit
# ─────────────────────────────────────────────────
echo ""
echo "[1/3] Running Lynis system audit..."
echo "---------------------------------------------"

if command -v lynis &> /dev/null; then
    lynis audit system --no-colors --quick 2>&1 | tee "$REPORT_DIR/lynis_report_${TIMESTAMP}.txt"
    echo ""
    echo "[LYNIS] Report saved to: $REPORT_DIR/lynis_report_${TIMESTAMP}.txt"

    # Extract hardening index
    HARDENING_INDEX=$(grep "Hardening index" "$REPORT_DIR/lynis_report_${TIMESTAMP}.txt" | tail -1 || echo "N/A")
    echo "[LYNIS] $HARDENING_INDEX"
else
    echo "[LYNIS] Not installed. Installing..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update -qq && sudo apt-get install -y -qq lynis
    elif command -v yum &> /dev/null; then
        sudo yum install -y lynis
    fi
    lynis audit system --no-colors --quick 2>&1 | tee "$REPORT_DIR/lynis_report_${TIMESTAMP}.txt"
fi

# ─────────────────────────────────────────────────
# 2. CLAMAV — Antivirus Scan
# ─────────────────────────────────────────────────
echo ""
echo "[2/3] Running ClamAV antivirus scan..."
echo "---------------------------------------------"

if command -v clamscan &> /dev/null; then
    # Update virus definitions
    echo "[CLAMAV] Updating virus definitions..."
    sudo freshclam 2>/dev/null || echo "[CLAMAV] Warning: Could not update definitions"

    # Scan the application directory
    clamscan -r --infected --log="$REPORT_DIR/clamav_report_${TIMESTAMP}.txt" \
        /opt/plantcare/ /home/ 2>&1 | tail -20
    echo ""
    echo "[CLAMAV] Report saved to: $REPORT_DIR/clamav_report_${TIMESTAMP}.txt"
else
    echo "[CLAMAV] Not installed. Installing..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update -qq && sudo apt-get install -y -qq clamav clamav-daemon
    elif command -v yum &> /dev/null; then
        sudo yum install -y clamav clamd
    fi
    sudo freshclam 2>/dev/null || true
    clamscan -r --infected --log="$REPORT_DIR/clamav_report_${TIMESTAMP}.txt" \
        /opt/plantcare/ /home/ 2>&1 | tail -20
fi

# ─────────────────────────────────────────────────
# 3. CHKROOTKIT — Rootkit Detection
# ─────────────────────────────────────────────────
echo ""
echo "[3/3] Running chkrootkit scan..."
echo "---------------------------------------------"

if command -v chkrootkit &> /dev/null; then
    sudo chkrootkit 2>&1 | tee "$REPORT_DIR/chkrootkit_report_${TIMESTAMP}.txt"
    echo ""
    echo "[CHKROOTKIT] Report saved to: $REPORT_DIR/chkrootkit_report_${TIMESTAMP}.txt"
else
    echo "[CHKROOTKIT] Not installed. Installing..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update -qq && sudo apt-get install -y -qq chkrootkit
    elif command -v yum &> /dev/null; then
        sudo yum install -y chkrootkit
    fi
    sudo chkrootkit 2>&1 | tee "$REPORT_DIR/chkrootkit_report_${TIMESTAMP}.txt"
fi

# ─────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────
echo ""
echo "============================================="
echo "  Security Audit Complete"
echo "============================================="
echo "Reports saved to: $REPORT_DIR/"
echo ""
echo "Files generated:"
ls -la "$REPORT_DIR/"*"${TIMESTAMP}"* 2>/dev/null
echo ""
echo "NEXT STEPS:"
echo "  1. Review Lynis warnings and fix critical items"
echo "  2. Verify ClamAV found no infections"
echo "  3. Verify chkrootkit found no rootkits"
echo "  4. Document findings in the IEEE report"
echo "============================================="
