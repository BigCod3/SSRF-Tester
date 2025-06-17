import type { Caido } from "@caido/sdk-frontend";
import type { API, Events } from "../../backend/src/api";

export type FrontendSDK = Caido<API, Events>;