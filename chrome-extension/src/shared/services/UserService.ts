
interface UserInfo {
  name: string;
  world: string;
}

class UserService{

  getUserInfo(): UserInfo{
    return {
      name: "ziutek1993",
      world: "pl213",
    }
  }
}