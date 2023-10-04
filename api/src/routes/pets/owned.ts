import { ALL_PETS, type PetType } from '../../lib/constants';
import { getOwnedPets } from '../../modules/pets/pets.services';
import { getUser } from '../../modules/users/users.services';
import { ApiRoute } from '../../lib/types';
import { DatabaseError } from 'pg';

type Query = {
  userId: string;
};

const { API_SECRET, DISCORD_BOT_SECRET } = process.env;

export const GET: ApiRoute<true> = {
  handler: async (req, res) => {
    const { userId } = req.query as Query;

    const authorization = req.headers.authorization;
    if (authorization !== API_SECRET) {
      res.status(401).send('Invalid API key');

      return;
    }

    try {
      return res.status(200).send(await getOwnedPets(userId, true));
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: 'Internal error' });
    }
  },
  additional: {
    schema: {
      headers: {
        type: 'object',
        properties: {
          authorization: {
            type: 'string',
            minLength: 1
          }
        },
        required: ['authorization']
      },
      querystring: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            minLength: 17,
            maxLength: 20
          }
        },
        required: ['userId']
      }
    }
  }
};
