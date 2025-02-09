import type { RouteType } from "@/types/global";
import { body } from "express-validator";
import { DownloadController } from "./http/controllers/downloadController";

export const Routes = [
  {
    method: "post",
    route: "/download/url",
    controller: DownloadController,
    action: "downloadByURL",
    validation: [
      body("videoURL").isURL().withMessage("Invalid URL"),
    ],
    authorization: false
  }, {
    method: "post",
    route: "/download/title",
    controller: DownloadController,
    action: "downloadByTitle",
    validation: [
      body("videoTitle").isString().withMessage("Invalid title"),
    ],
  }
] as RouteType[];