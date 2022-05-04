export interface Payload {
    UserId: number;
    RoleId: number;
    UserName: string;
}

export class Resp<T> {
    StatusCode :number;
    Message: string;
    Data: T;
    constructor(StatusCode:number,Message:string,Data:T)
    {
        this.StatusCode=StatusCode;
        this.Message=Message;
        this.Data=Data;
    }
}

export interface Login {
    Account: string;
    Password: string;
}

export interface Article {    
    Title: string;
    Content: string;
    User_Id: number;
    AdminId: number;
}

export interface Author {
    Name: string;
    AdminId: number;
}


