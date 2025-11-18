import { apiClient } from "./api.config";
class AuthController {
  static getSession() {
    return localStorage.getItem("loginToken");
  }
  static setSession(token: string) {
    console.log(token);
    localStorage.setItem("loginToken", token);
  }
  static userLogin(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      apiClient
        .post("/login", data, {
          validateStatus: (status) => {
            return true;
          },
        })
        .then((res) => {
          if (res.status === 200) {
            resolve(res);
          } else {
            reject(res); // Handles non-200 statuses
          }
        })
        .catch(({ response }) => {
          reject(response); // Handles network or unexpected errors
        });
    });
  }
  static userSignup(data: any): Promise<any> {
    console.log(data);
    return new Promise((resolve, reject) => {
      apiClient
        .post("/signup", data)
        .then((res) => {
          if (res.status === 200) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch(({ response }) => {
          reject(response);
        });
    });
  }
}
export default AuthController;
