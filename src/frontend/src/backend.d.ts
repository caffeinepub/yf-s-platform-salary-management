import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface backendInterface {
    get(key: string): Promise<string | null>;
    getAll(): Promise<Array<[string, string]>>;
    remove(key: string): Promise<void>;
    set(key: string, value: string): Promise<void>;
}
