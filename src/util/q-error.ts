export enum Q_ERROR_CODE {
    CREATED_APPOINTMENT_NOT_FOUND = "E142",
    COUNTER_USER_LOGOUT = "8068",
    BLOCK_TRANSFER = "8082",
    APPOINTMENT_NOT_FOUND = "8057",
    APPOINTMENT_USED_VISIT = "8058",
    PRINTER_ERROR = "1251",
    HUB_PRINTER_ERROR = "3050",
    PRINTER_PAPER_OUT = "8113",
    PRINTER_PAPER_JAM = "8114",
    NO_VISIT = "8011",
    STAFF_MEMBER_LOGOUT="8068",
    SERVED_VISIT = "8082",
    QUEUE_FULL = "8042",
    SERVICE_DELETE = "8031"
}

export enum ERROR_STATUS {
    INTERNAL_ERROR = 500,
    CONFLICT = 409,
    NOT_FOUND = 404,
    SERVICE_UNAVAILABLE = 503,
    BAD_REQUEST = 400,
    TIMEOUT = 0
}

export enum PRINTER_ISSUE {
    NO_CONNECTION = "No connection to printer.",
    PAPER_JAM = "401 Paper jam.",
    PAPER_OUT = "405 Out of paper"
}