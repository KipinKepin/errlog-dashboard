import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  LayoutDashboard,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import OverseasHeatmap from "./components/OverseasHeatmap";
import {
  OVERSEAS_BRANCHES,
  BRANCH_FILTER_OPTIONS,
  matchesBranchFilter,
} from "./data/overseasBranches";

// --- 1. DUMMY DATASET (Exactly 25 records) ---
const RAW_DATA = [
  // Provided initial 3 records
  {
    LOG_ID: 7810,
    JOB_NAME: "ICN_INVM_BATCH",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "ICN_INVM_BATCH",
    START_TS: "2026-07-06 17:02:21",
    END_TS: "2026-07-06 17:02:35",
    DURATION: "",
    DATE_PARAM: "2026-07-05",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Unhandled abort encountered in job ICN_INVM_BATCH",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 7808,
    JOB_NAME: "DIM_ACCOUNT",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "DIM_ACCOUNT",
    START_TS: "2026-07-06 16:29:41",
    END_TS: "2026-07-06 16:30:37",
    DURATION: "0 days, 00:00:55",
    DATE_PARAM: "2026-07-02",
    TOTAL_ROW_COUNT: 0,
    MESSAGE: "DIM_ACCOUNT job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 7606,
    JOB_NAME: "DIM_ACCOUNT",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "DIM_ACCOUNT",
    START_TS: "2026-06-15 14:34:48",
    END_TS: "2026-06-15 14:51:59",
    DURATION: "0 days, 00:17:08",
    DATE_PARAM: "2026-06-09",
    TOTAL_ROW_COUNT: 27540301,
    MESSAGE: "DIM_ACCOUNT job completed successfully.",
    CATEGORY: "Luar Negeri",
  },

  // Generated 22 realistic records
  {
    LOG_ID: 7607,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-06-10 02:00:00",
    END_TS: "2026-06-10 03:45:12",
    DURATION: "0 days, 01:45:12",
    DATE_PARAM: "2026-06-09",
    TOTAL_ROW_COUNT: 1540300,
    MESSAGE: "FACT_TRANSACTION job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 7608,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-06-11 02:00:00",
    END_TS: "2026-06-11 02:15:30",
    DURATION: "",
    DATE_PARAM: "2026-06-10",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Fatal abort encountered during hash join.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 7609,
    JOB_NAME: "STG_CUSTOMER",
    SCHEMA_NAME: "STG",
    TABLE_NAME: "STG_CUSTOMER",
    START_TS: "2026-06-12 01:00:00",
    END_TS: "2026-06-12 01:05:00",
    DURATION: "0 days, 00:05:00",
    DATE_PARAM: "2026-06-11",
    TOTAL_ROW_COUNT: 85000,
    MESSAGE: "STG_CUSTOMER job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 7610,
    JOB_NAME: "HR_SYNC",
    SCHEMA_NAME: "HR",
    TABLE_NAME: "EMP_DATA",
    START_TS: "2026-06-13 04:00:00",
    END_TS: "2026-06-13 04:02:10",
    DURATION: "0 days, 00:02:10",
    DATE_PARAM: "2026-06-12",
    TOTAL_ROW_COUNT: 1250,
    MESSAGE: "Job finished with zero warnings.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 7611,
    JOB_NAME: "AGG_DAILY_SALES",
    SCHEMA_NAME: "DM",
    TABLE_NAME: "AGG_DAILY_SALES",
    START_TS: "2026-06-14 05:00:00",
    END_TS: "2026-06-14 05:30:00",
    DURATION: "0 days, 00:30:00",
    DATE_PARAM: "2026-06-13",
    TOTAL_ROW_COUNT: 450,
    MESSAGE: "AGG_DAILY_SALES job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 7612,
    JOB_NAME: "DIM_ACCOUNT",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "DIM_ACCOUNT",
    START_TS: "2026-06-16 14:30:00",
    END_TS: "2026-06-16 14:48:00",
    DURATION: "0 days, 00:18:00",
    DATE_PARAM: "2026-06-15",
    TOTAL_ROW_COUNT: 27550100,
    MESSAGE: "DIM_ACCOUNT job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 7613,
    JOB_NAME: "ICN_INVM_BATCH",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "ICN_INVM_BATCH",
    START_TS: "2026-06-17 17:00:00",
    END_TS: "2026-06-17 17:05:00",
    DURATION: "",
    DATE_PARAM: "2026-06-16",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Memory overflow abort encountered in job.",
    CATEGORY: "Dalam Negeri",
  },

  {
    LOG_ID: 7614,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-06-18 02:00:00",
    END_TS: "2026-06-18 02:10:00",
    DURATION: "",
    DATE_PARAM: "2026-06-17",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Network timeout abort encountered.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 7615,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-06-19 02:00:00",
    END_TS: "2026-06-19 02:12:00",
    DURATION: "",
    DATE_PARAM: "2026-06-18",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Unhandled abort encountered due to source DB lock.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 7616,
    JOB_NAME: "STG_CUSTOMER",
    SCHEMA_NAME: "STG",
    TABLE_NAME: "STG_CUSTOMER",
    START_TS: "2026-06-20 01:00:00",
    END_TS: "2026-06-20 01:06:15",
    DURATION: "0 days, 00:06:15",
    DATE_PARAM: "2026-06-19",
    TOTAL_ROW_COUNT: 110500,
    MESSAGE: "STG_CUSTOMER job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 7617,
    JOB_NAME: "AGG_DAILY_SALES",
    SCHEMA_NAME: "DM",
    TABLE_NAME: "AGG_DAILY_SALES",
    START_TS: "2026-06-21 05:00:00",
    END_TS: "2026-06-21 05:25:00",
    DURATION: "0 days, 00:25:00",
    DATE_PARAM: "2026-06-20",
    TOTAL_ROW_COUNT: 390,
    MESSAGE: "AGG_DAILY_SALES job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 7618,
    JOB_NAME: "DIM_ACCOUNT",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "DIM_ACCOUNT",
    START_TS: "2026-06-22 14:30:00",
    END_TS: "2026-06-22 14:47:30",
    DURATION: "0 days, 00:17:30",
    DATE_PARAM: "2026-06-21",
    TOTAL_ROW_COUNT: 1540301,
    MESSAGE: "DIM_ACCOUNT job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 7619,
    JOB_NAME: "HR_SYNC",
    SCHEMA_NAME: "HR",
    TABLE_NAME: "EMP_DATA",
    START_TS: "2026-06-23 04:00:00",
    END_TS: "2026-06-23 04:02:00",
    DURATION: "0 days, 00:02:00",
    DATE_PARAM: "2026-06-22",
    TOTAL_ROW_COUNT: 1255,
    MESSAGE: "HR_SYNC job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 7620,
    JOB_NAME: "ICN_INVM_BATCH",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "ICN_INVM_BATCH",
    START_TS: "2026-06-24 17:00:00",
    END_TS: "2026-06-24 17:03:00",
    DURATION: "",
    DATE_PARAM: "2026-06-23",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Data type mismatch abort encountered.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 7621,
    JOB_NAME: "STG_CUSTOMER",
    SCHEMA_NAME: "STG",
    TABLE_NAME: "STG_CUSTOMER",
    START_TS: "2026-06-25 01:00:00",
    END_TS: "2026-06-25 01:01:00",
    DURATION: "0 days, 00:01:00",
    DATE_PARAM: "2026-06-24",
    TOTAL_ROW_COUNT: 0,
    MESSAGE: "Job finished, no new records.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 7622,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-06-26 02:00:00",
    END_TS: "2026-06-26 03:50:00",
    DURATION: "0 days, 01:50:00",
    DATE_PARAM: "2026-06-25",
    TOTAL_ROW_COUNT: 2150300,
    MESSAGE: "FACT_TRANSACTION job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 7623,
    JOB_NAME: "AGG_DAILY_SALES",
    SCHEMA_NAME: "DM",
    TABLE_NAME: "AGG_DAILY_SALES",
    START_TS: "2026-06-27 05:00:00",
    END_TS: "2026-06-27 05:05:00",
    DURATION: "",
    DATE_PARAM: "2026-06-26",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Disk full abort encountered.",
    CATEGORY: "Luar Negeri",
  },

  {
    LOG_ID: 7624,
    JOB_NAME: "STG_CUSTOMER",
    SCHEMA_NAME: "STG",
    TABLE_NAME: "STG_CUSTOMER",
    START_TS: "2026-07-08 01:00:00",
    END_TS: "2026-07-08 01:04:00",
    DURATION: "0 days, 00:04:00",
    DATE_PARAM: "2026-07-07",
    TOTAL_ROW_COUNT: 92000,
    MESSAGE: "STG_CUSTOMER job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 7625,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-07-09 02:00:00",
    END_TS: "2026-07-09 03:40:00",
    DURATION: "0 days, 01:40:00",
    DATE_PARAM: "2026-07-08",
    TOTAL_ROW_COUNT: 1640300,
    MESSAGE: "FACT_TRANSACTION job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 7626,
    JOB_NAME: "HR_SYNC",
    SCHEMA_NAME: "HR",
    TABLE_NAME: "EMP_DATA",
    START_TS: "2026-07-09 04:00:00",
    END_TS: "2026-07-09 04:02:30",
    DURATION: "0 days, 00:02:30",
    DATE_PARAM: "2026-07-08",
    TOTAL_ROW_COUNT: 1260,
    MESSAGE: "Job finished without errors.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 7627,
    JOB_NAME: "HR_SYNC",
    SCHEMA_NAME: "HR",
    TABLE_NAME: "EMP_DATA",
    START_TS: "2026-07-10 04:00:00",
    END_TS: "2026-07-10 04:02:00",
    DURATION: "0 days, 00:02:00",
    DATE_PARAM: "2026-07-09",
    TOTAL_ROW_COUNT: 1260,
    MESSAGE: "HR_SYNC job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 7628,
    JOB_NAME: "STG_CUSTOMER",
    SCHEMA_NAME: "STG",
    TABLE_NAME: "STG_CUSTOMER",
    START_TS: "2026-07-10 01:00:00",
    END_TS: "2026-07-10 01:05:00",
    DURATION: "0 days, 00:05:00",
    DATE_PARAM: "2026-07-09",
    TOTAL_ROW_COUNT: 93500,
    MESSAGE: "STG_CUSTOMER job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8001,
    JOB_NAME: "FIN_GL_SYNC",
    SCHEMA_NAME: "FIN",
    TABLE_NAME: "GL_BALANCES",
    START_TS: "2026-08-01 01:00:00",
    END_TS: "2026-08-01 01:15:30",
    DURATION: "0 days, 00:15:30",
    DATE_PARAM: "2026-07-31",
    TOTAL_ROW_COUNT: 45000,
    MESSAGE: "FIN_GL_SYNC job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8002,
    JOB_NAME: "CRM_LEADS_ETL",
    SCHEMA_NAME: "CRM",
    TABLE_NAME: "LEADS_DATA",
    START_TS: "2026-08-01 02:00:00",
    END_TS: "2026-08-01 02:45:10",
    DURATION: "0 days, 00:45:10",
    DATE_PARAM: "2026-07-31",
    TOTAL_ROW_COUNT: 120500,
    MESSAGE: "CRM_LEADS_ETL job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8003,
    JOB_NAME: "PAY_RECON",
    SCHEMA_NAME: "PAY",
    TABLE_NAME: "RECON_LOG",
    START_TS: "2026-08-01 03:00:00",
    END_TS: "2026-08-01 03:05:00",
    DURATION: "0 days, 00:05:00",
    DATE_PARAM: "2026-07-31",
    TOTAL_ROW_COUNT: 8900,
    MESSAGE: "PAY_RECON job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8004,
    JOB_NAME: "INV_STOCK_OP",
    SCHEMA_NAME: "INV",
    TABLE_NAME: "STOCK_OPNAME",
    START_TS: "2026-08-01 04:00:00",
    END_TS: "2026-08-01 04:20:00",
    DURATION: "0 days, 00:20:00",
    DATE_PARAM: "2026-07-31",
    TOTAL_ROW_COUNT: 34000,
    MESSAGE: "INV_STOCK_OP job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8005,
    JOB_NAME: "B2B_PARTNER_SYNC",
    SCHEMA_NAME: "B2B",
    TABLE_NAME: "PARTNER_API_LOG",
    START_TS: "2026-08-01 05:00:00",
    END_TS: "2026-08-01 05:02:11",
    DURATION: "",
    DATE_PARAM: "2026-07-31",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Network timeout abort encountered during API fetch.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8006,
    JOB_NAME: "MKT_CAMPAIGN_SYNC",
    SCHEMA_NAME: "MKT",
    TABLE_NAME: "CAMPAIGN_METRICS",
    START_TS: "2026-08-01 06:00:00",
    END_TS: "2026-08-01 06:01:05",
    DURATION: "",
    DATE_PARAM: "2026-07-31",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Fatal abort encountered: invalid JSON payload.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8007,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-08-01 07:00:00",
    END_TS: "2026-08-01 07:10:00",
    DURATION: "",
    DATE_PARAM: "2026-07-31",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Memory overflow abort encountered in job FACT_TRANSACTION.",
    CATEGORY: "Luar Negeri",
  },

  // --- HARI 2 (2026-08-02): 5 Success, 2 Failed ---
  {
    LOG_ID: 8008,
    JOB_NAME: "STG_CUSTOMER",
    SCHEMA_NAME: "STG",
    TABLE_NAME: "STG_CUSTOMER",
    START_TS: "2026-08-02 01:00:00",
    END_TS: "2026-08-02 01:12:00",
    DURATION: "0 days, 00:12:00",
    DATE_PARAM: "2026-08-01",
    TOTAL_ROW_COUNT: 11000,
    MESSAGE: "STG_CUSTOMER job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8009,
    JOB_NAME: "HR_SYNC",
    SCHEMA_NAME: "HR",
    TABLE_NAME: "EMP_DATA",
    START_TS: "2026-08-02 02:00:00",
    END_TS: "2026-08-02 02:03:00",
    DURATION: "0 days, 00:03:00",
    DATE_PARAM: "2026-08-01",
    TOTAL_ROW_COUNT: 1250,
    MESSAGE: "HR_SYNC job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8010,
    JOB_NAME: "RISK_SCORING_ETL",
    SCHEMA_NAME: "RISK",
    TABLE_NAME: "USER_SCORES",
    START_TS: "2026-08-02 03:00:00",
    END_TS: "2026-08-02 03:50:00",
    DURATION: "0 days, 00:50:00",
    DATE_PARAM: "2026-08-01",
    TOTAL_ROW_COUNT: 500000,
    MESSAGE: "RISK_SCORING_ETL job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8011,
    JOB_NAME: "AUDIT_TRAIL_DUMP",
    SCHEMA_NAME: "SEC",
    TABLE_NAME: "AUDIT_LOGS",
    START_TS: "2026-08-02 04:00:00",
    END_TS: "2026-08-02 04:22:00",
    DURATION: "0 days, 00:22:00",
    DATE_PARAM: "2026-08-01",
    TOTAL_ROW_COUNT: 980000,
    MESSAGE: "AUDIT_TRAIL_DUMP job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8012,
    JOB_NAME: "AGG_DAILY_SALES",
    SCHEMA_NAME: "DM",
    TABLE_NAME: "AGG_DAILY_SALES",
    START_TS: "2026-08-02 05:00:00",
    END_TS: "2026-08-02 05:15:00",
    DURATION: "0 days, 00:15:00",
    DATE_PARAM: "2026-08-01",
    TOTAL_ROW_COUNT: 350,
    MESSAGE: "AGG_DAILY_SALES job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8013,
    JOB_NAME: "PAY_RECON",
    SCHEMA_NAME: "PAY",
    TABLE_NAME: "RECON_LOG",
    START_TS: "2026-08-02 06:00:00",
    END_TS: "2026-08-02 06:02:00",
    DURATION: "",
    DATE_PARAM: "2026-08-01",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Data type mismatch abort encountered.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8014,
    JOB_NAME: "INV_STOCK_OP",
    SCHEMA_NAME: "INV",
    TABLE_NAME: "STOCK_OPNAME",
    START_TS: "2026-08-02 07:00:00",
    END_TS: "2026-08-02 07:05:00",
    DURATION: "",
    DATE_PARAM: "2026-08-01",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Unhandled abort encountered due to deadlocks.",
    CATEGORY: "Luar Negeri",
  },

  // --- HARI 3 (2026-08-03): 2 Success, 6 Failed (SPIKE ERROR) ---
  {
    LOG_ID: 8015,
    JOB_NAME: "DIM_ACCOUNT",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "DIM_ACCOUNT",
    START_TS: "2026-08-03 01:00:00",
    END_TS: "2026-08-03 01:17:00",
    DURATION: "0 days, 00:17:00",
    DATE_PARAM: "2026-08-02",
    TOTAL_ROW_COUNT: 2750000,
    MESSAGE: "DIM_ACCOUNT job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8016,
    JOB_NAME: "DIM_ACCOUNT",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "DIM_ACCOUNT",
    START_TS: "2026-08-03 02:00:00",
    END_TS: "2026-08-03 02:18:00",
    DURATION: "0 days, 00:18:00",
    DATE_PARAM: "2026-08-02",
    TOTAL_ROW_COUNT: 1350000,
    MESSAGE: "DIM_ACCOUNT job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8017,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-08-03 03:00:00",
    END_TS: "2026-08-03 03:05:00",
    DURATION: "",
    DATE_PARAM: "2026-08-02",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Network timeout abort encountered during load.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8018,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-08-03 04:00:00",
    END_TS: "2026-08-03 04:05:00",
    DURATION: "",
    DATE_PARAM: "2026-08-02",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Network timeout abort encountered during load.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8019,
    JOB_NAME: "CRM_LEADS_ETL",
    SCHEMA_NAME: "CRM",
    TABLE_NAME: "LEADS_DATA",
    START_TS: "2026-08-03 05:00:00",
    END_TS: "2026-08-03 05:02:00",
    DURATION: "",
    DATE_PARAM: "2026-08-02",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Fatal abort encountered: duplicate keys.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8020,
    JOB_NAME: "FIN_GL_SYNC",
    SCHEMA_NAME: "FIN",
    TABLE_NAME: "GL_BALANCES",
    START_TS: "2026-08-03 06:00:00",
    END_TS: "2026-08-03 06:01:00",
    DURATION: "",
    DATE_PARAM: "2026-08-02",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Unhandled abort encountered: source DB offline.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8021,
    JOB_NAME: "HR_SYNC",
    SCHEMA_NAME: "HR",
    TABLE_NAME: "EMP_DATA",
    START_TS: "2026-08-03 07:00:00",
    END_TS: "2026-08-03 07:00:30",
    DURATION: "",
    DATE_PARAM: "2026-08-02",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Data type mismatch abort encountered in HR_SYNC.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8022,
    JOB_NAME: "ICN_INVM_BATCH",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "ICN_INVM_BATCH",
    START_TS: "2026-08-03 08:00:00",
    END_TS: "2026-08-03 08:02:00",
    DURATION: "",
    DATE_PARAM: "2026-08-02",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Memory overflow abort encountered.",
    CATEGORY: "Luar Negeri",
  },

  // --- HARI 4 (2026-08-04): 7 Success, 1 Failed ---
  {
    LOG_ID: 8023,
    JOB_NAME: "B2B_PARTNER_SYNC",
    SCHEMA_NAME: "B2B",
    TABLE_NAME: "PARTNER_API_LOG",
    START_TS: "2026-08-04 01:00:00",
    END_TS: "2026-08-04 01:05:00",
    DURATION: "0 days, 00:05:00",
    DATE_PARAM: "2026-08-03",
    TOTAL_ROW_COUNT: 300,
    MESSAGE: "B2B_PARTNER_SYNC job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8024,
    JOB_NAME: "PAY_RECON",
    SCHEMA_NAME: "PAY",
    TABLE_NAME: "RECON_LOG",
    START_TS: "2026-08-04 02:00:00",
    END_TS: "2026-08-04 02:10:00",
    DURATION: "0 days, 00:10:00",
    DATE_PARAM: "2026-08-03",
    TOTAL_ROW_COUNT: 9100,
    MESSAGE: "PAY_RECON job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8025,
    JOB_NAME: "STG_CUSTOMER",
    SCHEMA_NAME: "STG",
    TABLE_NAME: "STG_CUSTOMER",
    START_TS: "2026-08-04 03:00:00",
    END_TS: "2026-08-04 03:07:00",
    DURATION: "0 days, 00:07:00",
    DATE_PARAM: "2026-08-03",
    TOTAL_ROW_COUNT: 11500,
    MESSAGE: "STG_CUSTOMER job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8026,
    JOB_NAME: "INV_STOCK_OP",
    SCHEMA_NAME: "INV",
    TABLE_NAME: "STOCK_OPNAME",
    START_TS: "2026-08-04 04:00:00",
    END_TS: "2026-08-04 04:15:00",
    DURATION: "0 days, 00:15:00",
    DATE_PARAM: "2026-08-03",
    TOTAL_ROW_COUNT: 34500,
    MESSAGE: "INV_STOCK_OP job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8027,
    JOB_NAME: "MKT_CAMPAIGN_SYNC",
    SCHEMA_NAME: "MKT",
    TABLE_NAME: "CAMPAIGN_METRICS",
    START_TS: "2026-08-04 05:00:00",
    END_TS: "2026-08-04 05:08:00",
    DURATION: "0 days, 00:08:00",
    DATE_PARAM: "2026-08-03",
    TOTAL_ROW_COUNT: 2100,
    MESSAGE: "MKT_CAMPAIGN_SYNC job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8028,
    JOB_NAME: "RISK_SCORING_ETL",
    SCHEMA_NAME: "RISK",
    TABLE_NAME: "USER_SCORES",
    START_TS: "2026-08-04 06:00:00",
    END_TS: "2026-08-04 06:45:00",
    DURATION: "0 days, 00:45:00",
    DATE_PARAM: "2026-08-03",
    TOTAL_ROW_COUNT: 495000,
    MESSAGE: "RISK_SCORING_ETL job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8029,
    JOB_NAME: "AUDIT_TRAIL_DUMP",
    SCHEMA_NAME: "SEC",
    TABLE_NAME: "AUDIT_LOGS",
    START_TS: "2026-08-04 07:00:00",
    END_TS: "2026-08-04 07:25:00",
    DURATION: "0 days, 00:25:00",
    DATE_PARAM: "2026-08-03",
    TOTAL_ROW_COUNT: 1050000,
    MESSAGE: "AUDIT_TRAIL_DUMP job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8030,
    JOB_NAME: "AGG_DAILY_SALES",
    SCHEMA_NAME: "DM",
    TABLE_NAME: "AGG_DAILY_SALES",
    START_TS: "2026-08-04 08:00:00",
    END_TS: "2026-08-04 08:01:00",
    DURATION: "",
    DATE_PARAM: "2026-08-03",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Unhandled abort encountered: division by zero.",
    CATEGORY: "Luar Negeri",
  },

  // --- HARI 5 (2026-08-05): 6 Success, 2 Failed ---
  {
    LOG_ID: 8031,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-08-05 01:00:00",
    END_TS: "2026-08-05 02:30:00",
    DURATION: "0 days, 01:30:00",
    DATE_PARAM: "2026-08-04",
    TOTAL_ROW_COUNT: 2100000,
    MESSAGE: "FACT_TRANSACTION job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8032,
    JOB_NAME: "FIN_GL_SYNC",
    SCHEMA_NAME: "FIN",
    TABLE_NAME: "GL_BALANCES",
    START_TS: "2026-08-05 02:00:00",
    END_TS: "2026-08-05 02:14:00",
    DURATION: "0 days, 00:14:00",
    DATE_PARAM: "2026-08-04",
    TOTAL_ROW_COUNT: 44000,
    MESSAGE: "FIN_GL_SYNC job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8033,
    JOB_NAME: "HR_SYNC",
    SCHEMA_NAME: "HR",
    TABLE_NAME: "EMP_DATA",
    START_TS: "2026-08-05 03:00:00",
    END_TS: "2026-08-05 03:02:30",
    DURATION: "0 days, 00:02:30",
    DATE_PARAM: "2026-08-04",
    TOTAL_ROW_COUNT: 1255,
    MESSAGE: "HR_SYNC job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8034,
    JOB_NAME: "CRM_LEADS_ETL",
    SCHEMA_NAME: "CRM",
    TABLE_NAME: "LEADS_DATA",
    START_TS: "2026-08-05 04:00:00",
    END_TS: "2026-08-05 04:40:00",
    DURATION: "0 days, 00:40:00",
    DATE_PARAM: "2026-08-04",
    TOTAL_ROW_COUNT: 119000,
    MESSAGE: "CRM_LEADS_ETL job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8035,
    JOB_NAME: "PAY_RECON",
    SCHEMA_NAME: "PAY",
    TABLE_NAME: "RECON_LOG",
    START_TS: "2026-08-05 05:00:00",
    END_TS: "2026-08-05 05:09:00",
    DURATION: "0 days, 00:09:00",
    DATE_PARAM: "2026-08-04",
    TOTAL_ROW_COUNT: 9200,
    MESSAGE: "PAY_RECON job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8036,
    JOB_NAME: "INV_STOCK_OP",
    SCHEMA_NAME: "INV",
    TABLE_NAME: "STOCK_OPNAME",
    START_TS: "2026-08-05 06:00:00",
    END_TS: "2026-08-05 06:19:00",
    DURATION: "0 days, 00:19:00",
    DATE_PARAM: "2026-08-04",
    TOTAL_ROW_COUNT: 35000,
    MESSAGE: "INV_STOCK_OP job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8037,
    JOB_NAME: "B2B_PARTNER_SYNC",
    SCHEMA_NAME: "B2B",
    TABLE_NAME: "PARTNER_API_LOG",
    START_TS: "2026-08-05 07:00:00",
    END_TS: "2026-08-05 07:01:00",
    DURATION: "",
    DATE_PARAM: "2026-08-04",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Fatal abort encountered: connection refused.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8038,
    JOB_NAME: "RISK_SCORING_ETL",
    SCHEMA_NAME: "RISK",
    TABLE_NAME: "USER_SCORES",
    START_TS: "2026-08-05 08:00:00",
    END_TS: "2026-08-05 08:15:00",
    DURATION: "",
    DATE_PARAM: "2026-08-04",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Memory overflow abort encountered.",
    CATEGORY: "Dalam Negeri",
  },

  // --- HARI 6 (2026-08-06): 4 Success, 4 Failed ---
  {
    LOG_ID: 8039,
    JOB_NAME: "STG_CUSTOMER",
    SCHEMA_NAME: "STG",
    TABLE_NAME: "STG_CUSTOMER",
    START_TS: "2026-08-06 01:00:00",
    END_TS: "2026-08-06 01:10:00",
    DURATION: "0 days, 00:10:00",
    DATE_PARAM: "2026-08-05",
    TOTAL_ROW_COUNT: 11200,
    MESSAGE: "STG_CUSTOMER job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8040,
    JOB_NAME: "DIM_ACCOUNT",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "DIM_ACCOUNT",
    START_TS: "2026-08-06 02:00:00",
    END_TS: "2026-08-06 02:16:00",
    DURATION: "0 days, 00:16:00",
    DATE_PARAM: "2026-08-05",
    TOTAL_ROW_COUNT: 1360000,
    MESSAGE: "DIM_ACCOUNT job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8041,
    JOB_NAME: "MKT_CAMPAIGN_SYNC",
    SCHEMA_NAME: "MKT",
    TABLE_NAME: "CAMPAIGN_METRICS",
    START_TS: "2026-08-06 03:00:00",
    END_TS: "2026-08-06 03:07:00",
    DURATION: "0 days, 00:07:00",
    DATE_PARAM: "2026-08-05",
    TOTAL_ROW_COUNT: 2150,
    MESSAGE: "MKT_CAMPAIGN_SYNC job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8042,
    JOB_NAME: "AUDIT_TRAIL_DUMP",
    SCHEMA_NAME: "SEC",
    TABLE_NAME: "AUDIT_LOGS",
    START_TS: "2026-08-06 04:00:00",
    END_TS: "2026-08-06 04:23:00",
    DURATION: "0 days, 00:23:00",
    DATE_PARAM: "2026-08-05",
    TOTAL_ROW_COUNT: 990000,
    MESSAGE: "AUDIT_TRAIL_DUMP job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8043,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-08-06 05:00:00",
    END_TS: "2026-08-06 05:03:00",
    DURATION: "",
    DATE_PARAM: "2026-08-05",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Unhandled abort encountered in worker node 3.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8044,
    JOB_NAME: "ICN_INVM_BATCH",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "ICN_INVM_BATCH",
    START_TS: "2026-08-06 06:00:00",
    END_TS: "2026-08-06 06:02:00",
    DURATION: "",
    DATE_PARAM: "2026-08-05",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Data type mismatch abort encountered.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8045,
    JOB_NAME: "FIN_GL_SYNC",
    SCHEMA_NAME: "FIN",
    TABLE_NAME: "GL_BALANCES",
    START_TS: "2026-08-06 07:00:00",
    END_TS: "2026-08-06 07:01:00",
    DURATION: "",
    DATE_PARAM: "2026-08-05",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Network timeout abort encountered.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8046,
    JOB_NAME: "HR_SYNC",
    SCHEMA_NAME: "HR",
    TABLE_NAME: "EMP_DATA",
    START_TS: "2026-08-06 08:00:00",
    END_TS: "2026-08-06 08:00:30",
    DURATION: "",
    DATE_PARAM: "2026-08-05",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Fatal abort encountered: disk I/O error.",
    CATEGORY: "Luar Negeri",
  },

  // --- HARI 7 (2026-08-07): 1 Success, 5 Failed (SPIKE ERROR) ---
  {
    LOG_ID: 8047,
    JOB_NAME: "AGG_DAILY_SALES",
    SCHEMA_NAME: "DM",
    TABLE_NAME: "AGG_DAILY_SALES",
    START_TS: "2026-08-07 01:00:00",
    END_TS: "2026-08-07 01:14:00",
    DURATION: "0 days, 00:14:00",
    DATE_PARAM: "2026-08-06",
    TOTAL_ROW_COUNT: 360,
    MESSAGE: "AGG_DAILY_SALES job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8048,
    JOB_NAME: "PAY_RECON",
    SCHEMA_NAME: "PAY",
    TABLE_NAME: "RECON_LOG",
    START_TS: "2026-08-07 02:00:00",
    END_TS: "2026-08-07 02:01:00",
    DURATION: "",
    DATE_PARAM: "2026-08-06",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Network timeout abort encountered.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8049,
    JOB_NAME: "PAY_RECON",
    SCHEMA_NAME: "PAY",
    TABLE_NAME: "RECON_LOG",
    START_TS: "2026-08-07 03:00:00",
    END_TS: "2026-08-07 03:01:30",
    DURATION: "",
    DATE_PARAM: "2026-08-06",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Network timeout abort encountered (Retry 1).",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8050,
    JOB_NAME: "CRM_LEADS_ETL",
    SCHEMA_NAME: "CRM",
    TABLE_NAME: "LEADS_DATA",
    START_TS: "2026-08-07 04:00:00",
    END_TS: "2026-08-07 04:05:00",
    DURATION: "",
    DATE_PARAM: "2026-08-06",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Memory overflow abort encountered.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8051,
    JOB_NAME: "B2B_PARTNER_SYNC",
    SCHEMA_NAME: "B2B",
    TABLE_NAME: "PARTNER_API_LOG",
    START_TS: "2026-08-07 05:00:00",
    END_TS: "2026-08-07 05:01:00",
    DURATION: "",
    DATE_PARAM: "2026-08-06",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Unhandled abort encountered: API limit reached.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8052,
    JOB_NAME: "STG_CUSTOMER",
    SCHEMA_NAME: "STG",
    TABLE_NAME: "STG_CUSTOMER",
    START_TS: "2026-08-07 06:00:00",
    END_TS: "2026-08-07 06:02:00",
    DURATION: "",
    DATE_PARAM: "2026-08-06",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Fatal abort encountered: missing columns.",
    CATEGORY: "Dalam Negeri",
  },

  // --- HARI 8 (2026-08-08): 8 Success, 0 Failed (ALL GREEN) ---
  {
    LOG_ID: 8053,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-08-08 01:00:00",
    END_TS: "2026-08-08 02:40:00",
    DURATION: "0 days, 01:40:00",
    DATE_PARAM: "2026-08-07",
    TOTAL_ROW_COUNT: 2150000,
    MESSAGE: "FACT_TRANSACTION job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8054,
    JOB_NAME: "DIM_ACCOUNT",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "DIM_ACCOUNT",
    START_TS: "2026-08-08 03:00:00",
    END_TS: "2026-08-08 03:17:00",
    DURATION: "0 days, 00:17:00",
    DATE_PARAM: "2026-08-07",
    TOTAL_ROW_COUNT: 1370000,
    MESSAGE: "DIM_ACCOUNT job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8055,
    JOB_NAME: "ICN_INVM_BATCH",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "ICN_INVM_BATCH",
    START_TS: "2026-08-08 04:00:00",
    END_TS: "2026-08-08 04:12:00",
    DURATION: "0 days, 00:12:00",
    DATE_PARAM: "2026-08-07",
    TOTAL_ROW_COUNT: 42000,
    MESSAGE: "ICN_INVM_BATCH job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8056,
    JOB_NAME: "FIN_GL_SYNC",
    SCHEMA_NAME: "FIN",
    TABLE_NAME: "GL_BALANCES",
    START_TS: "2026-08-08 05:00:00",
    END_TS: "2026-08-08 05:15:00",
    DURATION: "0 days, 00:15:00",
    DATE_PARAM: "2026-08-07",
    TOTAL_ROW_COUNT: 45000,
    MESSAGE: "FIN_GL_SYNC job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8057,
    JOB_NAME: "HR_SYNC",
    SCHEMA_NAME: "HR",
    TABLE_NAME: "EMP_DATA",
    START_TS: "2026-08-08 06:00:00",
    END_TS: "2026-08-08 06:02:45",
    DURATION: "0 days, 00:02:45",
    DATE_PARAM: "2026-08-07",
    TOTAL_ROW_COUNT: 1260,
    MESSAGE: "HR_SYNC job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8058,
    JOB_NAME: "RISK_SCORING_ETL",
    SCHEMA_NAME: "RISK",
    TABLE_NAME: "USER_SCORES",
    START_TS: "2026-08-08 07:00:00",
    END_TS: "2026-08-08 07:48:00",
    DURATION: "0 days, 00:48:00",
    DATE_PARAM: "2026-08-07",
    TOTAL_ROW_COUNT: 505000,
    MESSAGE: "RISK_SCORING_ETL job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8059,
    JOB_NAME: "INV_STOCK_OP",
    SCHEMA_NAME: "INV",
    TABLE_NAME: "STOCK_OPNAME",
    START_TS: "2026-08-08 08:00:00",
    END_TS: "2026-08-08 08:21:00",
    DURATION: "0 days, 00:21:00",
    DATE_PARAM: "2026-08-07",
    TOTAL_ROW_COUNT: 36000,
    MESSAGE: "INV_STOCK_OP job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8060,
    JOB_NAME: "AUDIT_TRAIL_DUMP",
    SCHEMA_NAME: "SEC",
    TABLE_NAME: "AUDIT_LOGS",
    START_TS: "2026-08-08 09:00:00",
    END_TS: "2026-08-08 09:25:00",
    DURATION: "0 days, 00:25:00",
    DATE_PARAM: "2026-08-07",
    TOTAL_ROW_COUNT: 1010000,
    MESSAGE: "AUDIT_TRAIL_DUMP job completed successfully.",
    CATEGORY: "Luar Negeri",
  },

  // --- HARI 9 (2026-08-09): 5 Success, 3 Failed ---
  {
    LOG_ID: 8061,
    JOB_NAME: "MKT_CAMPAIGN_SYNC",
    SCHEMA_NAME: "MKT",
    TABLE_NAME: "CAMPAIGN_METRICS",
    START_TS: "2026-08-09 01:00:00",
    END_TS: "2026-08-09 01:08:00",
    DURATION: "0 days, 00:08:00",
    DATE_PARAM: "2026-08-08",
    TOTAL_ROW_COUNT: 2200,
    MESSAGE: "MKT_CAMPAIGN_SYNC job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8062,
    JOB_NAME: "B2B_PARTNER_SYNC",
    SCHEMA_NAME: "B2B",
    TABLE_NAME: "PARTNER_API_LOG",
    START_TS: "2026-08-09 02:00:00",
    END_TS: "2026-08-09 02:05:30",
    DURATION: "0 days, 00:05:30",
    DATE_PARAM: "2026-08-08",
    TOTAL_ROW_COUNT: 310,
    MESSAGE: "B2B_PARTNER_SYNC job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8063,
    JOB_NAME: "STG_CUSTOMER",
    SCHEMA_NAME: "STG",
    TABLE_NAME: "STG_CUSTOMER",
    START_TS: "2026-08-09 03:00:00",
    END_TS: "2026-08-09 03:11:00",
    DURATION: "0 days, 00:11:00",
    DATE_PARAM: "2026-08-08",
    TOTAL_ROW_COUNT: 11600,
    MESSAGE: "STG_CUSTOMER job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8064,
    JOB_NAME: "CRM_LEADS_ETL",
    SCHEMA_NAME: "CRM",
    TABLE_NAME: "LEADS_DATA",
    START_TS: "2026-08-09 04:00:00",
    END_TS: "2026-08-09 04:42:00",
    DURATION: "0 days, 00:42:00",
    DATE_PARAM: "2026-08-08",
    TOTAL_ROW_COUNT: 122000,
    MESSAGE: "CRM_LEADS_ETL job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8065,
    JOB_NAME: "AGG_DAILY_SALES",
    SCHEMA_NAME: "DM",
    TABLE_NAME: "AGG_DAILY_SALES",
    START_TS: "2026-08-09 05:00:00",
    END_TS: "2026-08-09 05:15:30",
    DURATION: "0 days, 00:15:30",
    DATE_PARAM: "2026-08-08",
    TOTAL_ROW_COUNT: 370,
    MESSAGE: "AGG_DAILY_SALES job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8066,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-08-09 06:00:00",
    END_TS: "2026-08-09 06:10:00",
    DURATION: "",
    DATE_PARAM: "2026-08-08",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Data type mismatch abort encountered in JSON field.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8067,
    JOB_NAME: "DIM_ACCOUNT",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "DIM_ACCOUNT",
    START_TS: "2026-08-09 07:00:00",
    END_TS: "2026-08-09 07:05:00",
    DURATION: "",
    DATE_PARAM: "2026-08-08",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Fatal abort encountered: ORA-01555 snapshot too old.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8068,
    JOB_NAME: "PAY_RECON",
    SCHEMA_NAME: "PAY",
    TABLE_NAME: "RECON_LOG",
    START_TS: "2026-08-09 08:00:00",
    END_TS: "2026-08-09 08:02:00",
    DURATION: "",
    DATE_PARAM: "2026-08-08",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Unhandled abort encountered: null pointer exception.",
    CATEGORY: "Luar Negeri",
  },

  // --- HARI 10 (2026-08-10): 4 Success, 2 Failed ---
  {
    LOG_ID: 8069,
    JOB_NAME: "FIN_GL_SYNC",
    SCHEMA_NAME: "FIN",
    TABLE_NAME: "GL_BALANCES",
    START_TS: "2026-08-10 01:00:00",
    END_TS: "2026-08-10 01:14:30",
    DURATION: "0 days, 00:14:30",
    DATE_PARAM: "2026-08-09",
    TOTAL_ROW_COUNT: 45500,
    MESSAGE: "FIN_GL_SYNC job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8070,
    JOB_NAME: "HR_SYNC",
    SCHEMA_NAME: "HR",
    TABLE_NAME: "EMP_DATA",
    START_TS: "2026-08-10 02:00:00",
    END_TS: "2026-08-10 02:02:40",
    DURATION: "0 days, 00:02:40",
    DATE_PARAM: "2026-08-09",
    TOTAL_ROW_COUNT: 1265,
    MESSAGE: "HR_SYNC job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8071,
    JOB_NAME: "INV_STOCK_OP",
    SCHEMA_NAME: "INV",
    TABLE_NAME: "STOCK_OPNAME",
    START_TS: "2026-08-10 03:00:00",
    END_TS: "2026-08-10 03:22:00",
    DURATION: "0 days, 00:22:00",
    DATE_PARAM: "2026-08-09",
    TOTAL_ROW_COUNT: 36500,
    MESSAGE: "INV_STOCK_OP job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8072,
    JOB_NAME: "RISK_SCORING_ETL",
    SCHEMA_NAME: "RISK",
    TABLE_NAME: "USER_SCORES",
    START_TS: "2026-08-10 04:00:00",
    END_TS: "2026-08-10 04:50:00",
    DURATION: "0 days, 00:50:00",
    DATE_PARAM: "2026-08-09",
    TOTAL_ROW_COUNT: 510000,
    MESSAGE: "RISK_SCORING_ETL job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8073,
    JOB_NAME: "ICN_INVM_BATCH",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "ICN_INVM_BATCH",
    START_TS: "2026-08-10 05:00:00",
    END_TS: "2026-08-10 05:05:00",
    DURATION: "",
    DATE_PARAM: "2026-08-09",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Network timeout abort encountered.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8074,
    JOB_NAME: "MKT_CAMPAIGN_SYNC",
    SCHEMA_NAME: "MKT",
    TABLE_NAME: "CAMPAIGN_METRICS",
    START_TS: "2026-08-10 06:00:00",
    END_TS: "2026-08-10 06:03:00",
    DURATION: "",
    DATE_PARAM: "2026-08-09",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Fatal abort encountered: token expired.",
    CATEGORY: "Luar Negeri",
  },

  // --- HARI 11 (2026-08-11): 3 Success, 4 Failed ---
  {
    LOG_ID: 8075,
    JOB_NAME: "AUDIT_TRAIL_DUMP",
    SCHEMA_NAME: "SEC",
    TABLE_NAME: "AUDIT_LOGS",
    START_TS: "2026-08-11 01:00:00",
    END_TS: "2026-08-11 01:24:00",
    DURATION: "0 days, 00:24:00",
    DATE_PARAM: "2026-08-10",
    TOTAL_ROW_COUNT: 1020000,
    MESSAGE: "AUDIT_TRAIL_DUMP job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8076,
    JOB_NAME: "B2B_PARTNER_SYNC",
    SCHEMA_NAME: "B2B",
    TABLE_NAME: "PARTNER_API_LOG",
    START_TS: "2026-08-11 02:00:00",
    END_TS: "2026-08-11 02:05:10",
    DURATION: "0 days, 00:05:10",
    DATE_PARAM: "2026-08-10",
    TOTAL_ROW_COUNT: 315,
    MESSAGE: "B2B_PARTNER_SYNC job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8077,
    JOB_NAME: "CRM_LEADS_ETL",
    SCHEMA_NAME: "CRM",
    TABLE_NAME: "LEADS_DATA",
    START_TS: "2026-08-11 03:00:00",
    END_TS: "2026-08-11 03:41:00",
    DURATION: "0 days, 00:41:00",
    DATE_PARAM: "2026-08-10",
    TOTAL_ROW_COUNT: 123500,
    MESSAGE: "CRM_LEADS_ETL job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8078,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-08-11 04:00:00",
    END_TS: "2026-08-11 04:20:00",
    DURATION: "",
    DATE_PARAM: "2026-08-10",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Memory overflow abort encountered.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8079,
    JOB_NAME: "STG_CUSTOMER",
    SCHEMA_NAME: "STG",
    TABLE_NAME: "STG_CUSTOMER",
    START_TS: "2026-08-11 05:00:00",
    END_TS: "2026-08-11 05:04:00",
    DURATION: "",
    DATE_PARAM: "2026-08-10",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Unhandled abort encountered: corrupted index.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8080,
    JOB_NAME: "PAY_RECON",
    SCHEMA_NAME: "PAY",
    TABLE_NAME: "RECON_LOG",
    START_TS: "2026-08-11 06:00:00",
    END_TS: "2026-08-11 06:01:00",
    DURATION: "",
    DATE_PARAM: "2026-08-10",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Network timeout abort encountered.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8081,
    JOB_NAME: "AGG_DAILY_SALES",
    SCHEMA_NAME: "DM",
    TABLE_NAME: "AGG_DAILY_SALES",
    START_TS: "2026-08-11 07:00:00",
    END_TS: "2026-08-11 07:02:00",
    DURATION: "",
    DATE_PARAM: "2026-08-10",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Fatal abort encountered: lock wait timeout.",
    CATEGORY: "Dalam Negeri",
  },

  // --- HARI 12 (2026-08-12): 2 Success, 6 Failed (SPIKE ERROR KEDUA) ---
  {
    LOG_ID: 8082,
    JOB_NAME: "DIM_ACCOUNT",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "DIM_ACCOUNT",
    START_TS: "2026-08-12 01:00:00",
    END_TS: "2026-08-12 01:18:00",
    DURATION: "0 days, 00:18:00",
    DATE_PARAM: "2026-08-11",
    TOTAL_ROW_COUNT: 1380000,
    MESSAGE: "DIM_ACCOUNT job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8083,
    JOB_NAME: "FIN_GL_SYNC",
    SCHEMA_NAME: "FIN",
    TABLE_NAME: "GL_BALANCES",
    START_TS: "2026-08-12 02:00:00",
    END_TS: "2026-08-12 02:15:00",
    DURATION: "0 days, 00:15:00",
    DATE_PARAM: "2026-08-11",
    TOTAL_ROW_COUNT: 46000,
    MESSAGE: "FIN_GL_SYNC job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8084,
    JOB_NAME: "HR_SYNC",
    SCHEMA_NAME: "HR",
    TABLE_NAME: "EMP_DATA",
    START_TS: "2026-08-12 03:00:00",
    END_TS: "2026-08-12 03:01:00",
    DURATION: "",
    DATE_PARAM: "2026-08-11",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Data type mismatch abort encountered.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8085,
    JOB_NAME: "ICN_INVM_BATCH",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "ICN_INVM_BATCH",
    START_TS: "2026-08-12 04:00:00",
    END_TS: "2026-08-12 04:05:00",
    DURATION: "",
    DATE_PARAM: "2026-08-11",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Network timeout abort encountered.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8086,
    JOB_NAME: "INV_STOCK_OP",
    SCHEMA_NAME: "INV",
    TABLE_NAME: "STOCK_OPNAME",
    START_TS: "2026-08-12 05:00:00",
    END_TS: "2026-08-12 05:03:00",
    DURATION: "",
    DATE_PARAM: "2026-08-11",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Memory overflow abort encountered.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8087,
    JOB_NAME: "RISK_SCORING_ETL",
    SCHEMA_NAME: "RISK",
    TABLE_NAME: "USER_SCORES",
    START_TS: "2026-08-12 06:00:00",
    END_TS: "2026-08-12 06:12:00",
    DURATION: "",
    DATE_PARAM: "2026-08-11",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Unhandled abort encountered: CPU spike.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8088,
    JOB_NAME: "MKT_CAMPAIGN_SYNC",
    SCHEMA_NAME: "MKT",
    TABLE_NAME: "CAMPAIGN_METRICS",
    START_TS: "2026-08-12 07:00:00",
    END_TS: "2026-08-12 07:02:00",
    DURATION: "",
    DATE_PARAM: "2026-08-11",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Fatal abort encountered: unauthorized access.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8089,
    JOB_NAME: "B2B_PARTNER_SYNC",
    SCHEMA_NAME: "B2B",
    TABLE_NAME: "PARTNER_API_LOG",
    START_TS: "2026-08-12 08:00:00",
    END_TS: "2026-08-12 08:01:00",
    DURATION: "",
    DATE_PARAM: "2026-08-11",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Network timeout abort encountered.",
    CATEGORY: "Dalam Negeri",
  },

  // --- HARI 13 (2026-08-13): 5 Success, 2 Failed ---
  {
    LOG_ID: 8090,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-08-13 01:00:00",
    END_TS: "2026-08-13 02:45:00",
    DURATION: "0 days, 01:45:00",
    DATE_PARAM: "2026-08-12",
    TOTAL_ROW_COUNT: 2180000,
    MESSAGE: "FACT_TRANSACTION job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8091,
    JOB_NAME: "STG_CUSTOMER",
    SCHEMA_NAME: "STG",
    TABLE_NAME: "STG_CUSTOMER",
    START_TS: "2026-08-13 03:00:00",
    END_TS: "2026-08-13 03:10:30",
    DURATION: "0 days, 00:10:30",
    DATE_PARAM: "2026-08-12",
    TOTAL_ROW_COUNT: 11800,
    MESSAGE: "STG_CUSTOMER job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8092,
    JOB_NAME: "AUDIT_TRAIL_DUMP",
    SCHEMA_NAME: "SEC",
    TABLE_NAME: "AUDIT_LOGS",
    START_TS: "2026-08-13 04:00:00",
    END_TS: "2026-08-13 04:26:00",
    DURATION: "0 days, 00:26:00",
    DATE_PARAM: "2026-08-12",
    TOTAL_ROW_COUNT: 1025000,
    MESSAGE: "AUDIT_TRAIL_DUMP job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8093,
    JOB_NAME: "AGG_DAILY_SALES",
    SCHEMA_NAME: "DM",
    TABLE_NAME: "AGG_DAILY_SALES",
    START_TS: "2026-08-13 05:00:00",
    END_TS: "2026-08-13 05:16:00",
    DURATION: "0 days, 00:16:00",
    DATE_PARAM: "2026-08-12",
    TOTAL_ROW_COUNT: 380,
    MESSAGE: "AGG_DAILY_SALES job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8094,
    JOB_NAME: "PAY_RECON",
    SCHEMA_NAME: "PAY",
    TABLE_NAME: "RECON_LOG",
    START_TS: "2026-08-13 06:00:00",
    END_TS: "2026-08-13 06:11:00",
    DURATION: "0 days, 00:11:00",
    DATE_PARAM: "2026-08-12",
    TOTAL_ROW_COUNT: 9350,
    MESSAGE: "PAY_RECON job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8095,
    JOB_NAME: "CRM_LEADS_ETL",
    SCHEMA_NAME: "CRM",
    TABLE_NAME: "LEADS_DATA",
    START_TS: "2026-08-13 07:00:00",
    END_TS: "2026-08-13 07:04:00",
    DURATION: "",
    DATE_PARAM: "2026-08-12",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Unhandled abort encountered: invalid constraint.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8096,
    JOB_NAME: "FIN_GL_SYNC",
    SCHEMA_NAME: "FIN",
    TABLE_NAME: "GL_BALANCES",
    START_TS: "2026-08-13 08:00:00",
    END_TS: "2026-08-13 08:01:00",
    DURATION: "",
    DATE_PARAM: "2026-08-12",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Network timeout abort encountered.",
    CATEGORY: "Luar Negeri",
  },

  // --- HARI 14 (2026-08-14): 3 Success, 1 Failed (SISA DATA UNTUK GENAP 100) ---
  {
    LOG_ID: 8097,
    JOB_NAME: "HR_SYNC",
    SCHEMA_NAME: "HR",
    TABLE_NAME: "EMP_DATA",
    START_TS: "2026-08-14 01:00:00",
    END_TS: "2026-08-14 01:03:00",
    DURATION: "0 days, 00:03:00",
    DATE_PARAM: "2026-08-13",
    TOTAL_ROW_COUNT: 1270,
    MESSAGE: "HR_SYNC job completed successfully.",
    CATEGORY: "Luar Negeri",
  },
  {
    LOG_ID: 8098,
    JOB_NAME: "DIM_ACCOUNT",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "DIM_ACCOUNT",
    START_TS: "2026-08-14 02:00:00",
    END_TS: "2026-08-14 02:17:30",
    DURATION: "0 days, 00:17:30",
    DATE_PARAM: "2026-08-13",
    TOTAL_ROW_COUNT: 2780000,
    MESSAGE: "DIM_ACCOUNT job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8099,
    JOB_NAME: "RISK_SCORING_ETL",
    SCHEMA_NAME: "RISK",
    TABLE_NAME: "USER_SCORES",
    START_TS: "2026-08-14 03:00:00",
    END_TS: "2026-08-14 03:52:00",
    DURATION: "0 days, 00:52:00",
    DATE_PARAM: "2026-08-13",
    TOTAL_ROW_COUNT: 515000,
    MESSAGE: "RISK_SCORING_ETL job completed successfully.",
    CATEGORY: "Dalam Negeri",
  },
  {
    LOG_ID: 8100,
    JOB_NAME: "FACT_TRANSACTION",
    SCHEMA_NAME: "THE",
    TABLE_NAME: "FACT_TRANSACTION",
    START_TS: "2026-08-14 04:00:00",
    END_TS: "2026-08-14 04:15:00",
    DURATION: "",
    DATE_PARAM: "2026-08-13",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Fatal abort encountered: disk full.",
    CATEGORY: "Luar Negeri",
    BRANCH: "Seoul - Korea Selatan",
  },
  // Additional Overseas Branch (KCLN) Records across June & July for all 7 branches
  {
    LOG_ID: 8101,
    JOB_NAME: "KRW_CLEARING_BATCH",
    SCHEMA_NAME: "PAY",
    TABLE_NAME: "KRW_SETTLEMENT",
    START_TS: "2026-06-18 03:10:00",
    END_TS: "2026-06-18 03:14:20",
    DURATION: "",
    DATE_PARAM: "2026-06-17",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Unhandled abort encountered in BOK clearing gateway Seoul.",
    CATEGORY: "Luar Negeri",
    BRANCH: "Seoul - Korea Selatan",
  },
  {
    LOG_ID: 8102,
    JOB_NAME: "SEOUL_LOAN_SYNC",
    SCHEMA_NAME: "FIN",
    TABLE_NAME: "CORP_LOAN_KR",
    START_TS: "2026-07-04 02:00:00",
    END_TS: "2026-07-04 02:18:45",
    DURATION: "0 days, 00:18:45",
    DATE_PARAM: "2026-07-03",
    TOTAL_ROW_COUNT: 64200,
    MESSAGE: "SEOUL_LOAN_SYNC job completed successfully.",
    CATEGORY: "Luar Negeri",
    BRANCH: "Seoul - Korea Selatan",
  },
  {
    LOG_ID: 8103,
    JOB_NAME: "FX_RATES_FEED",
    SCHEMA_NAME: "FIN",
    TABLE_NAME: "FX_DAILY_RATES",
    START_TS: "2026-07-12 05:00:00",
    END_TS: "2026-07-12 05:03:10",
    DURATION: "",
    DATE_PARAM: "2026-07-11",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Network timeout abort encountered on Seoul FX feed.",
    CATEGORY: "Luar Negeri",
    BRANCH: "Seoul - Korea Selatan",
  },
  {
    LOG_ID: 8104,
    JOB_NAME: "MAS_REG_REPORT",
    SCHEMA_NAME: "SEC",
    TABLE_NAME: "MAS_COMPLIANCE",
    START_TS: "2026-07-14 01:30:00",
    END_TS: "2026-07-14 01:49:10",
    DURATION: "0 days, 00:19:10",
    DATE_PARAM: "2026-07-13",
    TOTAL_ROW_COUNT: 315000,
    MESSAGE: "MAS_REG_REPORT job completed successfully.",
    CATEGORY: "Luar Negeri",
    BRANCH: "Singapura",
  },
  {
    LOG_ID: 8105,
    JOB_NAME: "SG_FAST_RECON",
    SCHEMA_NAME: "PAY",
    TABLE_NAME: "FAST_TXN_SG",
    START_TS: "2026-07-15 04:00:00",
    END_TS: "2026-07-15 04:02:15",
    DURATION: "",
    DATE_PARAM: "2026-07-14",
    TOTAL_ROW_COUNT: null,
    MESSAGE:
      "Fatal abort encountered: schema validation error in SG_FAST_RECON.",
    CATEGORY: "Luar Negeri",
    BRANCH: "Singapura",
  },
  {
    LOG_ID: 8106,
    JOB_NAME: "HKMA_LIQUIDITY_ETL",
    SCHEMA_NAME: "RISK",
    TABLE_NAME: "HK_LIQ_RATIO",
    START_TS: "2026-07-16 03:00:00",
    END_TS: "2026-07-16 03:22:00",
    DURATION: "0 days, 00:22:00",
    DATE_PARAM: "2026-07-15",
    TOTAL_ROW_COUNT: 142000,
    MESSAGE: "HKMA_LIQUIDITY_ETL job completed successfully.",
    CATEGORY: "Luar Negeri",
    BRANCH: "Hong Kong",
  },
  {
    LOG_ID: 8107,
    JOB_NAME: "BOJ_SETTLEMENT_SYNC",
    SCHEMA_NAME: "FIN",
    TABLE_NAME: "JPY_LEDGER_TYO",
    START_TS: "2026-07-18 02:15:00",
    END_TS: "2026-07-18 02:19:00",
    DURATION: "",
    DATE_PARAM: "2026-07-17",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Unhandled abort encountered: BOJ host connection reset.",
    CATEGORY: "Luar Negeri",
    BRANCH: "Tokyo - Jepang",
  },
  {
    LOG_ID: 8108,
    JOB_NAME: "KANSAI_TRADE_BATCH",
    SCHEMA_NAME: "B2B",
    TABLE_NAME: "OSAKA_TRADE_FIN",
    START_TS: "2026-07-19 03:30:00",
    END_TS: "2026-07-19 03:44:20",
    DURATION: "0 days, 00:14:20",
    DATE_PARAM: "2026-07-18",
    TOTAL_ROW_COUNT: 28400,
    MESSAGE: "KANSAI_TRADE_BATCH job completed successfully.",
    CATEGORY: "Luar Negeri",
    BRANCH: "Osaka - Jepang",
  },
  {
    LOG_ID: 8109,
    JOB_NAME: "OSAKA_GL_POSTING",
    SCHEMA_NAME: "FIN",
    TABLE_NAME: "GL_BALANCES",
    START_TS: "2026-07-20 04:10:00",
    END_TS: "2026-07-20 04:12:40",
    DURATION: "",
    DATE_PARAM: "2026-07-19",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Data type mismatch abort encountered in OSAKA_GL_POSTING.",
    CATEGORY: "Luar Negeri",
    BRANCH: "Osaka - Jepang",
  },
  {
    LOG_ID: 8110,
    JOB_NAME: "FEDWIRE_RECON_NYC",
    SCHEMA_NAME: "PAY",
    TABLE_NAME: "USD_CLEARING",
    START_TS: "2026-07-22 06:00:00",
    END_TS: "2026-07-22 06:04:10",
    DURATION: "",
    DATE_PARAM: "2026-07-21",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Memory overflow abort encountered in FEDWIRE_RECON_NYC.",
    CATEGORY: "Luar Negeri",
    BRANCH: "New York - Amerika Serikat",
  },
  {
    LOG_ID: 8111,
    JOB_NAME: "OFAC_SCREENING_SYNC",
    SCHEMA_NAME: "SEC",
    TABLE_NAME: "SANCTION_LOGS",
    START_TS: "2026-07-23 01:20:00",
    END_TS: "2026-07-23 01:48:00",
    DURATION: "0 days, 00:28:00",
    DATE_PARAM: "2026-07-22",
    TOTAL_ROW_COUNT: 890000,
    MESSAGE: "OFAC_SCREENING_SYNC job completed successfully.",
    CATEGORY: "Luar Negeri",
    BRANCH: "New York - Amerika Serikat",
  },
  {
    LOG_ID: 8112,
    JOB_NAME: "CHAPS_GBP_SETTLE",
    SCHEMA_NAME: "PAY",
    TABLE_NAME: "GBP_RECON_LON",
    START_TS: "2026-07-25 04:00:00",
    END_TS: "2026-07-25 04:16:30",
    DURATION: "0 days, 00:16:30",
    DATE_PARAM: "2026-07-24",
    TOTAL_ROW_COUNT: 74500,
    MESSAGE: "CHAPS_GBP_SETTLE job completed successfully.",
    CATEGORY: "Luar Negeri",
    BRANCH: "London - Inggris",
  },
  {
    LOG_ID: 8113,
    JOB_NAME: "FCA_AUDIT_EXPORT",
    SCHEMA_NAME: "SEC",
    TABLE_NAME: "AUDIT_LOGS",
    START_TS: "2026-07-26 05:30:00",
    END_TS: "2026-07-26 05:33:15",
    DURATION: "",
    DATE_PARAM: "2026-07-25",
    TOTAL_ROW_COUNT: null,
    MESSAGE: "Fatal abort encountered: SFTP handshake timeout London gateway.",
    CATEGORY: "Luar Negeri",
    BRANCH: "London - Inggris",
  },
];

// Deterministic assignment of Overseas Branches for all "Luar Negeri" records
const BRANCH_ROTATION = OVERSEAS_BRANCHES.map((b) => b.id);
const ENRICHED_RAW_DATA = RAW_DATA.map((item, idx) => {
  if (item.CATEGORY !== "Luar Negeri") {
    return { ...item, BRANCH: "Jakarta - Dalam Negeri" };
  }
  const assignedBranch =
    item.BRANCH ||
    BRANCH_ROTATION[(item.LOG_ID + idx) % BRANCH_ROTATION.length];
  return {
    ...item,
    BRANCH: assignedBranch,
  };
});

// --- 2. CONSTANTS & UTILS ---
const COLORS = {
  Success: "#87d068",
  Failed: "#e04355",
  Unknown: "#faad14",
  Primary: "#20a7c9",
};

const getDerivedStatus = (message) => {
  if (!message) return "Unknown";
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes("completed successfully")) return "Success";
  if (lowerMsg.includes("abort encountered")) return "Failed";
  return "Unknown";
};

const parseDurationSeconds = (duration) => {
  if (!duration) return -1;
  const match = duration.match(/(\d+)\s*days?,\s*(\d+):(\d+):(\d+)/i);
  if (!match) return 0;
  const [, days, hours, minutes, seconds] = match.map(Number);
  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
};

const formatDuration = (duration) => {
  if (!duration) return "";
  const match = duration.match(/(\d+)\s*days?,\s*(\d+):(\d+):(\d+)/i);
  if (!match) return duration;
  const [, rawDays, rawHours, rawMinutes, rawSeconds] = match.map(Number);
  const totalSeconds =
    rawDays * 86400 + rawHours * 3600 + rawMinutes * 60 + rawSeconds;
  const days = Math.floor(totalSeconds / 86400);
  const hours = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(
    2,
    "0",
  );
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0",
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  const timeStr = `${hours}:${minutes}:${seconds}`;
  return days > 0 ? `${days} days, ${timeStr}` : timeStr;
};

const TIME_PERIOD_PRESETS = [
  {
    id: "All",
    label: "All Period (Jun - Aug)",
    start: "2026-06-01",
    end: "2026-08-31",
    granularity: "Daily",
  },
  {
    id: "Daily",
    label: "Daily (13 Aug)",
    start: "2026-08-13",
    end: "2026-08-13",
    granularity: "Daily",
  },
  {
    id: "3Days",
    label: "Last 3 Days (11 - 13 Aug)",
    start: "2026-08-11",
    end: "2026-08-13",
    granularity: "Daily",
  },
  {
    id: "Weekly",
    label: "Weekly (Last 7 Days)",
    start: "2026-08-07",
    end: "2026-08-13",
    granularity: "Daily",
  },
  {
    id: "BiWeekly",
    label: "Bi-Weekly (14 Days)",
    start: "2026-07-31",
    end: "2026-08-13",
    granularity: "Daily",
  },
  {
    id: "MonthlyAug",
    label: "Monthly (Agu 2026)",
    start: "2026-08-01",
    end: "2026-08-31",
    granularity: "Weekly",
  },
  {
    id: "MonthlyJul",
    label: "Monthly (Jul 2026)",
    start: "2026-07-01",
    end: "2026-07-31",
    granularity: "Weekly",
  },
  {
    id: "MonthlyJun",
    label: "Monthly (Jun 2026)",
    start: "2026-06-01",
    end: "2026-06-30",
    granularity: "Weekly",
  },
];

const getWeekBucket = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const day = dt.getUTCDay() || 7; // Monday = 1 .. Sunday = 7
  dt.setUTCDate(dt.getUTCDate() - day + 1);
  const wy = dt.getUTCFullYear();
  const wm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const wd = String(dt.getUTCDate()).padStart(2, "0");
  return {
    sortKey: `${wy}-${wm}-${wd}`,
    label: `Wk ${wm}/${wd}`,
  };
};

const getMonthBucket = (dateStr) => {
  const ym = dateStr.slice(0, 7);
  const monthNames = {
    "2026-06": "Jun 2026",
    "2026-07": "Jul 2026",
    "2026-08": "Agu 2026",
  };
  return {
    sortKey: ym,
    label: monthNames[ym] || ym,
  };
};

const classifyErrorCause = (message) => {
  const lower = (message || "").toLowerCase();
  if (lower.includes("timeout") || lower.includes("connection") || lower.includes("network") || lower.includes("handshake")) {
    return "Network / Timeout";
  }
  if (lower.includes("memory") || lower.includes("disk") || lower.includes("cpu") || lower.includes("i/o")) {
    return "Resource / Disk / Mem";
  }
  if (lower.includes("mismatch") || lower.includes("json") || lower.includes("column") || lower.includes("schema") || lower.includes("division")) {
    return "Data / Schema Error";
  }
  if (lower.includes("lock") || lower.includes("deadlock") || lower.includes("duplicate") || lower.includes("constraint") || lower.includes("ora-")) {
    return "DB Lock / Constraint";
  }
  return "System / Other Abort";
};

// Main App Component
export default function App() {
  // --- STATE ---
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [timePeriodPreset, setTimePeriodPreset] = useState("All");
  const [trendGranularity, setTrendGranularity] = useState("Daily"); // "Daily" | "Weekly" | "Monthly"
  const [thirdChartMode, setThirdChartMode] = useState("schema"); // "schema" | "cause"
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-08-31");
  const [statusFilter, setStatusFilter] = useState("All");
  const [jobSearch, setJobSearch] = useState("");

  const handleSelectTimePreset = (presetId) => {
    setTimePeriodPreset(presetId);
    setCurrentPage(1);
    const found = TIME_PERIOD_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setStartDate(found.start);
      setEndDate(found.end);
    }
  };

  // Table Global Search, Sort & Pagination State
  const [tableSearch, setTableSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (key) => {
    setCurrentPage(1);
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  // Base Overseas ("Luar Negeri") records filtered by date, status, and job search (used to power the Heatmap overview & branch pills)
  const overseasBaseData = useMemo(() => {
    return ENRICHED_RAW_DATA.map((d) => ({
      ...d,
      STATUS: getDerivedStatus(d.MESSAGE),
      TARGET: `${d.SCHEMA_NAME}.${d.TABLE_NAME}`,
    }))
      .filter((d) => d.CATEGORY === "Luar Negeri")
      .filter((d) => d.DATE_PARAM >= startDate && d.DATE_PARAM <= endDate)
      .filter((d) => statusFilter === "All" || d.STATUS === statusFilter)
      .filter((d) =>
        d.JOB_NAME.toLowerCase().includes(jobSearch.toLowerCase()),
      );
  }, [startDate, endDate, statusFilter, jobSearch]);

  // --- DERIVED DATA & MEMOIZATION ---
  const filteredData = useMemo(() => {
    return ENRICHED_RAW_DATA.map((d) => ({
      ...d,
      STATUS: getDerivedStatus(d.MESSAGE),
      TARGET: `${d.SCHEMA_NAME}.${d.TABLE_NAME}`,
    }))
      .filter(
        (d) => activeCategory === "Semua" || d.CATEGORY === activeCategory,
      )
      .filter((d) =>
        activeCategory === "Luar Negeri"
          ? matchesBranchFilter(d.BRANCH, selectedBranch)
          : true,
      )
      .filter((d) => d.DATE_PARAM >= startDate && d.DATE_PARAM <= endDate)
      .filter((d) => statusFilter === "All" || d.STATUS === statusFilter)
      .filter((d) =>
        d.JOB_NAME.toLowerCase().includes(jobSearch.toLowerCase()),
      );
  }, [
    activeCategory,
    selectedBranch,
    startDate,
    endDate,
    statusFilter,
    jobSearch,
  ]);

  // Table-specific filtered & sorted data
  const tableData = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    let result = !q
      ? filteredData
      : filteredData.filter((row) => {
          const durationDisplay = formatDuration(row.DURATION) || "Incomplete";
          const rawRows =
            row.TOTAL_ROW_COUNT !== null ? String(row.TOTAL_ROW_COUNT) : "-";
          const formattedRows =
            row.TOTAL_ROW_COUNT !== null
              ? row.TOTAL_ROW_COUNT.toLocaleString()
              : "-";

          return (
            row.STATUS.toLowerCase().includes(q) ||
            row.JOB_NAME.toLowerCase().includes(q) ||
            (row.BRANCH || "").toLowerCase().includes(q) ||
            row.TARGET.toLowerCase().includes(q) ||
            row.START_TS.toLowerCase().includes(q) ||
            durationDisplay.toLowerCase().includes(q) ||
            rawRows.toLowerCase().includes(q) ||
            formattedRows.toLowerCase().includes(q) ||
            (row.MESSAGE || "").toLowerCase().includes(q)
          );
        });

    if (sortConfig.key && sortConfig.direction) {
      const dir = sortConfig.direction === "asc" ? 1 : -1;
      result = [...result].sort((a, b) => {
        const key = sortConfig.key;
        if (key === "TOTAL_ROW_COUNT") {
          const valA = a.TOTAL_ROW_COUNT ?? -1;
          const valB = b.TOTAL_ROW_COUNT ?? -1;
          return (valA - valB) * dir;
        }
        if (key === "DURATION") {
          const valA = parseDurationSeconds(a.DURATION);
          const valB = parseDurationSeconds(b.DURATION);
          return (valA - valB) * dir;
        }
        const strA = String(a[key] ?? "");
        const strB = String(b[key] ?? "");
        return strA.localeCompare(strB) * dir;
      });
    }

    return result;
  }, [filteredData, tableSearch, sortConfig]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(tableData.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedTableData = useMemo(() => {
    return tableData.slice(startIndex, startIndex + pageSize);
  }, [tableData, startIndex, pageSize]);

  // KPIs
  const kpis = useMemo(() => {
    const total = filteredData.length;
    const success = filteredData.filter((d) => d.STATUS === "Success").length;
    const failed = filteredData.filter((d) => d.STATUS === "Failed").length;
    const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : 0;

    return { total, success, failed, successRate };
  }, [filteredData]);

  // Trend Data (Grouped by Daily, Weekly, or Monthly granularity)
  const trendData = useMemo(() => {
    const grouped = filteredData.reduce((acc, curr) => {
      let bucketKey = curr.DATE_PARAM;
      let bucketLabel = curr.DATE_PARAM;
      if (trendGranularity === "Weekly") {
        const wb = getWeekBucket(curr.DATE_PARAM);
        bucketKey = wb.sortKey;
        bucketLabel = wb.label;
      } else if (trendGranularity === "Monthly") {
        const mb = getMonthBucket(curr.DATE_PARAM);
        bucketKey = mb.sortKey;
        bucketLabel = mb.label;
      }

      if (!acc[bucketKey]) {
        acc[bucketKey] = {
          sortKey: bucketKey,
          date: bucketLabel,
          Success: 0,
          Failed: 0,
          Unknown: 0,
        };
      }
      acc[bucketKey][curr.STATUS] += 1;
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey),
    );
  }, [filteredData, trendGranularity]);

  // Top Failed Jobs
  const topFailedJobs = useMemo(() => {
    const grouped = filteredData
      .filter((d) => d.STATUS === "Failed")
      .reduce((acc, curr) => {
        acc[curr.JOB_NAME] = (acc[curr.JOB_NAME] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(grouped)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredData]);

  // Pie Chart Data
  const pieData = useMemo(() => {
    const counts = { Success: 0, Failed: 0, Unknown: 0 };
    filteredData.forEach((d) => counts[d.STATUS]++);
    return [
      { name: "Success", value: counts.Success },
      { name: "Failed", value: counts.Failed },
      { name: "Unknown", value: counts.Unknown },
    ].filter((d) => d.value > 0);
  }, [filteredData]);

  // 3rd Chart Data: Schema Execution Health (Success vs Failed per Schema)
  const schemaChartData = useMemo(() => {
    const grouped = filteredData.reduce((acc, curr) => {
      const sc = curr.SCHEMA_NAME || "OTHER";
      if (!acc[sc]) {
        acc[sc] = { schema: sc, Success: 0, Failed: 0, total: 0 };
      }
      if (curr.STATUS === "Success") acc[sc].Success += 1;
      else if (curr.STATUS === "Failed") acc[sc].Failed += 1;
      acc[sc].total += 1;
      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => b.total - a.total || b.Failed - a.Failed)
      .slice(0, 6);
  }, [filteredData]);

  // Alternative 3rd Chart Data: Error Root Cause Breakdown
  const errorCauseData = useMemo(() => {
    const grouped = filteredData
      .filter((d) => d.STATUS === "Failed")
      .reduce((acc, curr) => {
        const cause = classifyErrorCause(curr.MESSAGE);
        acc[cause] = (acc[cause] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(grouped)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData]);

  // --- RENDER HELPERS ---
  const renderStatusBadge = (status) => {
    const styles = {
      Success: "bg-[#87d068]/10 text-[#87d068] border-[#87d068]/30",
      Failed: "bg-[#e04355]/10 text-[#e04355] border-[#e04355]/30",
      Unknown: "bg-[#faad14]/10 text-[#faad14] border-[#faad14]/30",
    };

    const icons = {
      Success: <CheckCircle2 className="w-3 h-3 mr-1" />,
      Failed: <AlertCircle className="w-3 h-3 mr-1" />,
      Unknown: <HelpCircle className="w-3 h-3 mr-1" />,
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}
      >
        {icons[status]}
        {status}
      </span>
    );
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60 group-hover:opacity-100" />
      );
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#20a7c9]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#20a7c9]" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans text-sm selection:bg-[#20a7c9] selection:text-white">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 pt-5 pb-3">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#20a7c9]/10 rounded">
                <LayoutDashboard className="w-6 h-6 text-[#20a7c9]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 leading-tight">
                  ETL Error Monitoring
                </h1>
                <p className="text-gray-500 text-xs mt-0.5">
                  Observability dashboard for data pipeline executions
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-[#20a7c9] border border-[#20a7c9] rounded hover:bg-[#20a7c9]/5 transition-colors text-sm font-medium">
              <RefreshCw className="w-4 h-4" />
              Force Refresh
            </button>
          </div>

          {/* TABS */}
          <div className="flex gap-6 border-b border-gray-200 mt-2">
            {["Semua", "Dalam Negeri", "Luar Negeri"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveCategory(tab);
                  setCurrentPage(1);
                  if (tab !== "Luar Negeri") {
                    setSelectedBranch("All");
                  }
                }}
                className={`pb-3 px-1 font-medium transition-colors relative cursor-pointer ${
                  activeCategory === tab
                    ? "text-[#20a7c9] border-b-2 border-[#20a7c9]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* GLOBAL FILTER BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap gap-3 items-center shadow-sm">
        {/* Global Time Period Quick Filter */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded border border-gray-200">
          {TIME_PERIOD_PRESETS.slice(0, 6).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectTimePreset(preset.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                timePeriodPreset === preset.id
                  ? "bg-[#20a7c9] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
              }`}
            >
              {preset.id === "All"
                ? "All Time"
                : preset.id === "Daily"
                  ? "Daily"
                  : preset.id === "3Days"
                    ? "3 Days"
                    : preset.id === "Weekly"
                      ? "Weekly"
                      : preset.id === "BiWeekly"
                        ? "14 Days"
                        : "Monthly"}
            </button>
          ))}
        </div>

        {/* Custom Date Range Inputs */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setTimePeriodPreset("Custom");
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#20a7c9]"
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setTimePeriodPreset("Custom");
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#20a7c9]"
          />
        </div>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Trend Grouping / Time Granularity Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium">Grouping:</span>
          <select
            value={trendGranularity}
            onChange={(e) => setTrendGranularity(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#20a7c9] bg-white"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#20a7c9] bg-white min-w-[120px]"
          >
            <option value="All">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>

        {activeCategory === "Luar Negeri" && (
          <>
            <div className="h-6 w-px bg-gray-300 mx-1"></div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#20a7c9]" />
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-[#20a7c9]/50 rounded px-2.5 py-1 text-sm focus:outline-none focus:border-[#20a7c9] bg-[#20a7c9]/5 text-gray-800 font-medium min-w-[210px]"
              >
                {BRANCH_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {selectedBranch !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBranch("All");
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-[#e04355] bg-[#e04355]/10 px-2 py-1 rounded hover:bg-[#e04355]/20 transition-colors font-medium cursor-pointer"
                  title="Reset Filter Cabang"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset Cabang
                </button>
              )}
            </div>
          </>
        )}

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <div className="flex items-center gap-2 relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1.5" />
          <input
            type="text"
            placeholder="Search Job Name..."
            value={jobSearch}
            onChange={(e) => {
              setJobSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded pl-8 pr-2 py-1 text-sm focus:outline-none focus:border-[#20a7c9] w-full"
          />
        </div>
      </div>

      <main className="p-6 max-w-[1400px] mx-auto space-y-6">
        {/* OVERSEAS HEATMAP: HANYA MUNCUL DI TAB LUAR NEGERI */}
        {activeCategory === "Luar Negeri" && (
          <OverseasHeatmap
            overseasData={overseasBaseData}
            selectedBranch={selectedBranch}
            onSelectBranch={(branch) => {
              setSelectedBranch(branch);
              setCurrentPage(1);
            }}
          />
        )}

        {/* KPI SUMMARY ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm flex flex-col justify-center">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Total Executions
            </span>
            <span className="text-2xl font-bold text-gray-800">
              {kpis.total}
            </span>
            {activeCategory === "Luar Negeri" && (
              <span className="text-[11px] text-[#20a7c9] mt-1 font-medium">
                {selectedBranch === "All"
                  ? "Semua Cabang Luar Negeri"
                  : `Cabang: ${selectedBranch}`}
              </span>
            )}
          </div>
          <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm flex flex-col justify-center">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Successful
            </span>
            <span className="text-2xl font-bold text-[#87d068]">
              {kpis.success}
            </span>
            {activeCategory === "Luar Negeri" && (
              <span className="text-[11px] text-gray-400 mt-1">
                {selectedBranch === "All" ? "7 Lokasi Cabang" : selectedBranch}
              </span>
            )}
          </div>
          <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm flex flex-col justify-center">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Failed
            </span>
            <span className="text-2xl font-bold text-[#e04355]">
              {kpis.failed}
            </span>
            {activeCategory === "Luar Negeri" && (
              <span className="text-[11px] text-gray-400 mt-1">
                {selectedBranch === "All" ? "Total Error LN" : selectedBranch}
              </span>
            )}
          </div>
          <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm flex flex-col justify-center">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Success Rate
            </span>
            <span className="text-2xl font-bold text-gray-800">
              {kpis.successRate}%
            </span>
            {activeCategory === "Luar Negeri" && (
              <span className="text-[11px] text-gray-400 mt-1">
                {selectedBranch === "All" ? "Rata-rata LN" : selectedBranch}
              </span>
            )}
          </div>
        </div>

        {/* SECTION 1 (FULL WIDTH): EXECUTION TREND */}
        <div className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
              Execution Trend
              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {trendGranularity} Aggregation
              </span>
              {activeCategory === "Luar Negeri" && selectedBranch !== "All" && (
                <span className="text-xs font-medium text-[#20a7c9] bg-[#20a7c9]/10 px-2 py-0.5 rounded">
                  {selectedBranch}
                </span>
              )}
            </h2>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded border border-gray-200 text-xs">
              {["Daily", "Weekly", "Monthly"].map((gran) => (
                <button
                  key={gran}
                  type="button"
                  onClick={() => setTrendGranularity(gran)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    trendGranularity === gran
                      ? "bg-white text-[#20a7c9] shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {gran}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "4px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "13px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Success"
                    stroke={COLORS.Success}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Failed"
                    stroke={COLORS.Failed}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                No data available for the selected range
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2 (3 COLUMNS): STATUS DISTRIBUTION | TOP 5 FAILED JOBS | SCHEMA & ERROR BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COL 1: STATUS DISTRIBUTION */}
          <div className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center justify-between gap-2 flex-wrap">
              <span>Status Distribution</span>
              {activeCategory === "Luar Negeri" && selectedBranch !== "All" && (
                <span className="text-xs font-medium text-[#20a7c9] bg-[#20a7c9]/10 px-2 py-0.5 rounded">
                  {selectedBranch}
                </span>
              )}
            </h2>
            <div className="h-64 w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={256}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "4px",
                        border: "1px solid #e5e7eb",
                        fontSize: "13px",
                      }}
                      itemStyle={{ color: "#374151" }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: "13px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* COL 2: TOP 5 FAILED JOBS */}
          <div className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center justify-between gap-2 flex-wrap">
              <span>Top 5 Failed Jobs</span>
              {activeCategory === "Luar Negeri" && selectedBranch !== "All" && (
                <span className="text-xs font-medium text-[#20a7c9] bg-[#20a7c9]/10 px-2 py-0.5 rounded">
                  {selectedBranch}
                </span>
              )}
            </h2>
            <div className="h-64 w-full">
              {topFailedJobs.length > 0 ? (
                <ResponsiveContainer width="100%" height={256}>
                  <BarChart
                    data={topFailedJobs}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11, fill: "#374151" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f3f4f6" }}
                      contentStyle={{
                        borderRadius: "4px",
                        border: "1px solid #e5e7eb",
                        fontSize: "13px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Failed Runs"
                      fill={COLORS.Failed}
                      radius={[0, 4, 4, 0]}
                      barSize={22}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm text-center px-4">
                  Awesome! No failed jobs found for this selection.
                </div>
              )}
            </div>
          </div>

          {/* COL 3: SCHEMA HEALTH & ERROR CAUSE BREAKDOWN */}
          <div className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <h2 className="text-base font-semibold text-gray-800">
                {thirdChartMode === "schema"
                  ? "Executions by Schema"
                  : "Error Cause Breakdown"}
              </h2>
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded border border-gray-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setThirdChartMode("schema")}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    thirdChartMode === "schema"
                      ? "bg-white text-[#20a7c9] shadow-xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  By Schema
                </button>
                <button
                  type="button"
                  onClick={() => setThirdChartMode("cause")}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    thirdChartMode === "cause"
                      ? "bg-white text-[#20a7c9] shadow-xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Error Cause
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              {thirdChartMode === "schema" ? (
                schemaChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={256}>
                    <BarChart
                      data={schemaChartData}
                      margin={{ top: 5, right: 15, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                      />
                      <XAxis
                        dataKey="schema"
                        tick={{ fontSize: 11, fill: "#374151" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#f3f4f6" }}
                        contentStyle={{
                          borderRadius: "4px",
                          border: "1px solid #e5e7eb",
                          fontSize: "13px",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                      <Bar
                        dataKey="Success"
                        stackId="a"
                        fill={COLORS.Success}
                        radius={[0, 0, 0, 0]}
                        barSize={26}
                      />
                      <Bar
                        dataKey="Failed"
                        stackId="a"
                        fill={COLORS.Failed}
                        radius={[4, 4, 0, 0]}
                        barSize={26}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                    No schema execution data available
                  </div>
                )
              ) : errorCauseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={256}>
                  <BarChart
                    data={errorCauseData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={125}
                      tick={{ fontSize: 11, fill: "#374151" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f3f4f6" }}
                      contentStyle={{
                        borderRadius: "4px",
                        border: "1px solid #e5e7eb",
                        fontSize: "13px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Error Count"
                      fill="#faad14"
                      radius={[0, 4, 4, 0]}
                      barSize={22}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm text-center px-4">
                  No error causes recorded for this selection.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3 (FULL WIDTH): EXECUTION LOG DETAILS TABLE */}
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold text-gray-800">
                  Execution Log Details
                </h2>
                {activeCategory === "Luar Negeri" &&
                  selectedBranch !== "All" && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#20a7c9] bg-[#20a7c9]/10 border border-[#20a7c9]/20 px-2 py-0.5 rounded">
                      <MapPin className="w-3 h-3" />
                      {selectedBranch}
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-3">
                {sortConfig.key && (
                  <button
                    type="button"
                    onClick={() => {
                      setSortConfig({ key: null, direction: null });
                      setCurrentPage(1);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[#20a7c9] bg-[#20a7c9]/10 px-2 py-1 rounded hover:bg-[#20a7c9]/20 transition-colors font-medium"
                  >
                    <span>
                      Sorted by {sortConfig.key} ({sortConfig.direction})
                    </span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search all columns..."
                    value={tableSearch}
                    onChange={(e) => {
                      setTableSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 rounded pl-8 pr-7 py-1 text-xs bg-white text-gray-700 focus:outline-none focus:border-[#20a7c9]"
                  />
                  {tableSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setTableSearch("");
                        setCurrentPage(1);
                      }}
                      className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                  {tableData.length} records found
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold w-[110px]">
                      <button
                        type="button"
                        onClick={() => handleSort("STATUS")}
                        className="flex items-center gap-1.5 uppercase tracking-wider hover:text-gray-800 group w-full text-left"
                      >
                        <span>Status</span>
                        {renderSortIcon("STATUS")}
                      </button>
                    </th>
                    {activeCategory === "Luar Negeri" && (
                      <th className="px-4 py-3 font-semibold">
                        <button
                          type="button"
                          onClick={() => handleSort("BRANCH")}
                          className="flex items-center gap-1.5 uppercase tracking-wider hover:text-gray-800 group w-full text-left"
                        >
                          <span>Cabang</span>
                          {renderSortIcon("BRANCH")}
                        </button>
                      </th>
                    )}
                    <th className="px-4 py-3 font-semibold">
                      <button
                        type="button"
                        onClick={() => handleSort("JOB_NAME")}
                        className="flex items-center gap-1.5 uppercase tracking-wider hover:text-gray-800 group w-full text-left"
                      >
                        <span>Job Name</span>
                        {renderSortIcon("JOB_NAME")}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      <button
                        type="button"
                        onClick={() => handleSort("TARGET")}
                        className="flex items-center gap-1.5 uppercase tracking-wider hover:text-gray-800 group w-full text-left"
                      >
                        <span>Target (Schema.Table)</span>
                        {renderSortIcon("TARGET")}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      <button
                        type="button"
                        onClick={() => handleSort("START_TS")}
                        className="flex items-center gap-1.5 uppercase tracking-wider hover:text-gray-800 group w-full text-left"
                      >
                        <span>Start TS</span>
                        {renderSortIcon("START_TS")}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      <button
                        type="button"
                        onClick={() => handleSort("DURATION")}
                        className="flex items-center gap-1.5 uppercase tracking-wider hover:text-gray-800 group w-full text-left"
                      >
                        <span>Duration</span>
                        {renderSortIcon("DURATION")}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-semibold text-right">
                      <button
                        type="button"
                        onClick={() => handleSort("TOTAL_ROW_COUNT")}
                        className="flex items-center justify-end gap-1.5 uppercase tracking-wider hover:text-gray-800 group w-full text-right"
                      >
                        <span>Rows</span>
                        {renderSortIcon("TOTAL_ROW_COUNT")}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-semibold max-w-[250px]">
                      <button
                        type="button"
                        onClick={() => handleSort("MESSAGE")}
                        className="flex items-center gap-1.5 uppercase tracking-wider hover:text-gray-800 group w-full text-left"
                      >
                        <span>Message</span>
                        {renderSortIcon("MESSAGE")}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedTableData.length > 0 ? (
                    paginatedTableData.map((row) => (
                      <tr
                        key={row.LOG_ID}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          {renderStatusBadge(row.STATUS)}
                        </td>
                        {activeCategory === "Luar Negeri" && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBranch(
                                  selectedBranch === row.BRANCH
                                    ? "All"
                                    : row.BRANCH,
                                );
                                setCurrentPage(1);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 hover:bg-[#20a7c9]/10 text-gray-700 hover:text-[#20a7c9] border border-gray-200 transition-colors cursor-pointer"
                              title={`Filter berdasarkan cabang ${row.BRANCH}`}
                            >
                              <MapPin className="w-3 h-3 text-[#20a7c9]" />
                              {row.BRANCH}
                            </button>
                          </td>
                        )}
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {row.JOB_NAME}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <span className="text-gray-400">
                            {row.SCHEMA_NAME}.
                          </span>
                          {row.TABLE_NAME}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {row.START_TS}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap font-mono">
                          {row.DURATION ? (
                            formatDuration(row.DURATION)
                          ) : (
                            <span className="text-gray-400 italic font-sans">
                              Incomplete
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-right font-mono">
                          {row.TOTAL_ROW_COUNT !== null
                            ? row.TOTAL_ROW_COUNT.toLocaleString()
                            : "-"}
                        </td>
                        <td
                          className="px-4 py-3 text-gray-600 max-w-[250px] truncate"
                          title={row.MESSAGE}
                        >
                          {row.MESSAGE}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={activeCategory === "Luar Negeri" ? 8 : 7}
                        className="px-4 py-12 text-center text-gray-400 bg-white"
                      >
                        No execution records match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            {tableData.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-1.5 py-1 bg-white text-xs focus:outline-none focus:border-[#20a7c9]"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-gray-400 ml-2">
                    Showing {startIndex + 1}–
                    {Math.min(startIndex + pageSize, tableData.length)} of{" "}
                    {tableData.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[28px] h-7 px-2 rounded border text-xs font-medium transition-colors ${
                          safeCurrentPage === page
                            ? "bg-[#20a7c9] text-white border-[#20a7c9]"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
      </main>
    </div>
  );
}
