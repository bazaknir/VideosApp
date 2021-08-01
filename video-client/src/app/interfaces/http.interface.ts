export interface HttpStatus {
    status: IStatus;
}

export enum IStatus {
    OK = "OK",
    LIMIT = "By default, the API is rate-limited to 200 requests per hour and 20,000 requests per month, please try again later",
    ERROR = "Some error occurd"
}