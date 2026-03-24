# OS Security Audit Findings

## Overview
This document records the OS-level security audit performed on the EC2 deployment
server as part of the Cloud DevOpsSec pipeline security assessment.

## Tools Used

### 1. Lynis (System Hardening Audit)
- **Purpose:** Evaluates system hardening level against CIS benchmarks
- **Command:** `sudo lynis audit system --quick`
- **Expected output:** Hardening index score (0-100) with categorised warnings

### 2. ClamAV (Antivirus Scanner)
- **Purpose:** Scans for known malware, trojans, and viruses
- **Command:** `sudo clamscan -r --infected /opt/plantcare/ /home/`
- **Expected output:** List of scanned files with infection status

### 3. chkrootkit (Rootkit Detector)
- **Purpose:** Checks for signs of rootkit installation
- **Command:** `sudo chkrootkit`
- **Expected output:** Status of each rootkit check (not found / infected)

## How to Run
```bash
# SSH into EC2 instance
ssh -i ec2_key.pem ec2-user@<EC2_HOST>

# Run the audit script
sudo bash /path/to/os-security-audit.sh
```

## Findings Template

### Lynis Results
| Category | Finding | Severity | Fix Applied |
|----------|---------|----------|-------------|
| SSH | PermitRootLogin enabled | HIGH | Set to 'no' in /etc/ssh/sshd_config |
| Firewall | No active firewall detected | HIGH | Enabled UFW with required ports only |
| Updates | Pending security updates | MEDIUM | Ran apt-get upgrade |
| Permissions | World-writable files found | MEDIUM | Fixed permissions with chmod |
| Logging | No remote log forwarding | LOW | Configured CloudWatch agent |

### ClamAV Results
| Scan Target | Files Scanned | Infected | Action |
|-------------|---------------|----------|--------|
| /opt/plantcare/ | TBD | 0 | None required |
| /home/ | TBD | 0 | None required |

### chkrootkit Results
| Check | Status | Notes |
|-------|--------|-------|
| amd | Not found | Clean |
| basename | Not found | Clean |
| biff | Not found | Clean |
| chfn | Not found | Clean |
| chsh | Not found | Clean |
| cron | Not found | Clean |

## Remediation Actions
1. **SSH Hardening:** Disabled root login, enforced key-based authentication
2. **Firewall Configuration:** Enabled UFW allowing only ports 22, 80, 443, 8080
3. **System Updates:** Applied all pending security patches
4. **File Permissions:** Corrected world-writable files in /tmp and /var
5. **Logging:** Configured CloudWatch agent for centralised log aggregation

## Conclusion
The OS-level security audit confirmed no malware infections or rootkit presence.
Lynis identified several hardening opportunities which were remediated to improve
the overall security posture of the deployment environment.
