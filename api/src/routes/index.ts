import { ApiRoute, ApiRoutes } from "../lib/types";

// export const GET: ApiRoute = {
//   handler: async () => {
//     return { hello: "world" };
//   }
// }
export const routes: ApiRoutes = {
  GET: {
    handler: async () => {
      return { hello: "world" };
    }
  }
}