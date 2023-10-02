import { db, tables } from '../../lib/drizzle';
import { ApiRoute } from '../../lib/types';

export type Body = {
  id: string;
};

export const PUT: ApiRoute<true> = {
  handler: async (req, res) => {
    const { id } = req.body as Body;
    req.log.info(`[guildMemberAdd] Checking discord user with id: ${id}`);

    const alreadyExits = !!(await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.id, id)
    }));

    if (alreadyExits) {
      req.log.info(`[guildMemberAdd] User with id: ${id} already exists`);
      return res.status(400).send({ message: 'User already exists' });
    }

    const insertRes = await db.insert(tables.users).values({ id });
    if (insertRes.rowCount == 0) {
      req.log.error(`[guildMemberAdd] Failed to insert user with id: ${id}`);
      return res.status(500).send({ message: 'Failed to insert user' });
    }
  },
  additional: {
    schema: {
      body: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            minLength: 17,
            maxLength: 20
          }
        },
        required: ['id']
      }
    }
  }
};
