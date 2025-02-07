import type { RouteType } from "@/types/global";
import { body } from "express-validator";
import { DownloadController } from "./http/controllers/downloadController";

export const Routes = [
  {
    method: "post",
    route: "/download",
    controller: DownloadController,
    action: "downloadAudio",
    validation: [
      body("videoURL").isURL().withMessage("Invalid URL"),
    ],
    authorization: false
  }
] as RouteType[];