/* eslint-disable no-unused-vars */
export enum Status {
    success = 0,
    system_fail = -1,
    permission_denied = -2, // 沒有權限
    Incorrect_account_or_password = -3,
    login_timeout = -4,
    data_not_found = -5,
    token_not_found = -6,
    token_err = -7,
    header_err = -8,
}