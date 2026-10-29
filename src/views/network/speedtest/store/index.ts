import { atom } from "jotai";
import { emptyResult } from "../api";

export const connectionsAtom = atom<1 | 4>(4);
export const resultAtom = atom(emptyResult());
