import CoreEntity from 'src/common/entities/core.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import User from './user.entity';

@Entity()
class AuthToken extends CoreEntity {
  @Column({ default: false })
  disabled: boolean;

  @Column('int')
  fk_user_id: number;

  @ManyToOne(
    _ => User,
    user => user.id,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'fk_user_id' })
  user: User;
}

export default AuthToken;
