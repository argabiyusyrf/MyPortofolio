<?php
/* ============================================================
   config.php — shared constants for the visitor analytics system.
   Edit passcode hash here; all other files inherit it.
   ============================================================ */

declare(strict_types=1);

const VIS_DB_PATH        = __DIR__ . '/../.data/visits.sqlite';
const VIS_CODE_HASH      = '459277fd23dfcbb1de3d3e0c1695bbd8bbb8429c7e2a6f46af35286f31616c1a';
const VIS_SESSION_NAME   = 'visitors_session';
const VIS_RETENTION_DAYS = 180;
const VIS_DEDUP_SEC      = 15 * 60;
const VIS_RATE_PER_MIN   = 40;   // max track requests per vid per minute
const VIS_SALT           = 'x9Kp2mQ8vR';   // pepper for rate-limit hashing (not security-critical)