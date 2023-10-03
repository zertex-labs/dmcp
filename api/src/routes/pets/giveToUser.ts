import { ALL_PETS, type PetType } from '../../lib/constants';
import { createPet } from '../../modules/pets/pets.services';
import { getUser } from '../../modules/users/users.services';
import { ApiRoute } from '../../lib/types';

type Body = {
  userId: string;
  petName: string;
  petType: PetType;
};

export const POST: ApiRoute<true> = {
  handler: async (req, res) => {
    console.log(req.body);
    const { petType, userId, petName } = req.body as Body;

    try {
      const user = await getUser(userId);
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
    } catch (e) {
      res.status(500).send({ message: 'Internal error' });
    }
    try {
      const pet = await createPet({
        ownerId: userId,
        type: petType,
        displayName: petName
      });
    } catch (e) {
      res.status(500).send({ message: 'Internal error' });
    }
  },
  additional: {
    schema: {
      body: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            minLength: 17,
            maxLength: 20
          },
          petType: {
            type: 'string',
            enum: ALL_PETS
          },
          petName: {
            type: 'string',
            minLength: 5,
            maxLength: 32
          }
        },
        required: ['userId', 'petType', 'petName'],
      }
    }
  }
};
