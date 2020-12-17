class StrapIO {
  userRole;
  userId;

  constructor(strapi) {
    this.strapi = strapi;
    this.io = require("socket.io")(this.strapi.server, {
      cors: {
        origin: "*"
      }
    });

    this.io.use(async (client, next) => {
      if (client.handshake.headers && client.handshake.headers.token) {
        const token = client.handshake.headers.token

        try {
          const user = await this._upServices().jwt.verify(token)

          client.emit("status", "Connected");
  
          this._upServices()
            .user.fetchAuthenticatedUser(user.id)
            .then((detail) => {
              this.userRole = detail.role
              this.userId = user.id
              // join to private channel
              client.join(`${detail.role.name}${user.id}`)
            });
        } catch(err) {
          client.disconnect()
          console.log(err)
        }
        
      }
      next();
    });
  }

  async emit(identity, action, data) {
    const plugins = await this._upServices().userspermissions.getPlugins("en");
    
    if(!this.userRole || !this.userId) return

    const roleDetail = await this._upServices().userspermissions.getRole(
      this.userRole.id,
      plugins
    );
    if (
      roleDetail.permissions.application.controllers[
        identity.toLowerCase()
      ]["find"].enabled
    ) {
      this.io.sockets
        .in(`${roleDetail.name}${this.userId}`) // emit to private channel
        .emit(
          action,
          JSON.stringify({ identity: identity.toLowerCase(), action, ...data })
        );
    }
  }

  _upServices() {
    return this.strapi.plugins["users-permissions"].services;
  }
}

module.exports = StrapIO;