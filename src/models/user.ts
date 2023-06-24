export interface IUser {
    _id: string,
    name?: string,
    avatar?: string,
    token?: string,
    email?: string,
    profileStatus?: string,
}

export type IAuthState = {
    user: IUser | null
    token: string | null
}

export interface IUserRecord {
    [key: string]: IUser
}

export interface IUserState {
    userMap: IUserRecord // indexed users
}

export interface LoginRequest {
    username: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    name: string
}
export interface ILoginResponse {
    user: IUser
    token: string
}

export interface IUpdateProfileRequest {
    name?: string,
    avatar?: string,
    email?: string,
}

export interface IChangeStatusRequest {
    profileStatus: string,
}

export interface IUserRequestParams {
    search: string,
    limit?: number,
}