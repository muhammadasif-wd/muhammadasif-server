import express from "express";
import {NavigationRoutes} from "../modules/home/navbar/navigation.route";
import {SocialRoutes} from "../modules/home/social/social.route";
import {SubmenuRoutes} from "../modules/home/submenu/submenu.route";
import {fileUploadRoutes} from "../modules/file/file.route";
import {SkillRoutes} from "../modules/home/skill/skill.route";
import {ExperienceRoutes} from "../modules/home/experience/experience.route";
const router = express.Router();

const moduleRoutes = [
  {path: "/navigation", route: NavigationRoutes},
  {path: "/submenu", route: SubmenuRoutes},
  {path: "/social", route: SocialRoutes},
  {path: "/skill", route: SkillRoutes},
  {path: "/experience", route: ExperienceRoutes},
  {path: "/file", route: fileUploadRoutes},
];

moduleRoutes.forEach(({path, route}) => router.use(path, route));

export default router;