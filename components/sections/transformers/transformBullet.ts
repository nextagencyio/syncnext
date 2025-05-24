import { Entry } from 'contentful'
import { BulletProps } from '@/components/sidebyside/Sidebyside'

export interface BulletType {
  __typename: 'Bullet'
  icon: string
  summary: string
}

export function transformBullet(bullet: Entry<any>): BulletProps {
  const fields = bullet.fields
  const { icon, summary } = fields

  return {
    type: 'bullet',
    icon: icon as string,
    summary: summary as string,
  }
}
