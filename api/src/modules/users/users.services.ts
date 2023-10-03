import { InferInsertModel, eq } from 'drizzle-orm';
import { db, tables } from '../../lib/drizzle';

export const getUser = (id: string) =>
  db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, id),
    with: {
      pets: true
    }
  });

export const createUser = (data: InferInsertModel<typeof tables.users>) =>
  db.insert(tables.users).values(data).returning();

export const getOrCreateUser = async (
 id: string
): Promise<ReturnType<typeof getUser>> => {
  let user = await getUser(id);
  if (user) return user;

  const [insertUser] = await createUser({id});
  if (!insertUser) throw new Error('Failed to insert user');

  user = {
    ...insertUser,
    pets: []
  };

  return user;
};
