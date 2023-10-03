import axios from 'axios';

import { discordUUIDSchema } from '../../lib/fastifySchemas';
import { ApiRoute } from '../../lib/types';
import { createUser } from '../../modules/users/users.services';

type Body = {
  userId: string;
  serverId: string;
};

const { API_SECRET, DISCORD_BOT_SECRET } = process.env;

export const POST: ApiRoute<true> = {
  handler: async (req, res) => {
    const { serverId, userId } = req.body as Body;

    const authorization = req.headers.authorization;
    if (!authorization || authorization !== API_SECRET) {
      req.log.info('[users/create] Received untrusted request');

      // if secrets dont match we dont trust the response and need to verify the user id
      const url = `https://discord.com/api/guilds/${serverId}/members/${userId}`;

      let userIsReal = false;
      try {
        const userResponse = await axios.get(url, {
          headers: {
            Authorization: `Bot ${DISCORD_BOT_SECRET}`
          }
        });

        userIsReal = userResponse.status === 200;
      } catch (e) {
        // dont care didnt ask
      }

      if (!userIsReal) {
        res
          .status(401)
          .send(
            'The user is not in the server or the server/user id are invalid.'
          );
        return;
      }
    }

    try {
      await createUser({ id: userId });
    } catch (e) {
      console.error(e);
      res.status(500).send('Internal server error');
      return;
    }

    res.status(201).send({ userId, serverId });
  },
  additional: {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'serverId'],
        properties: {
          userId: discordUUIDSchema,
          serverId: discordUUIDSchema
        }
      }
    }
  }
};
