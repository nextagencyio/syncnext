import React from 'react'
import { resolveContentfulImage, ContentfulImage } from '@/utils/contentful'
import { Entry } from 'contentful'
import { StatCardProps } from '@/components/stat-card/StatCard'
import Image from 'next/image'

export interface StatsItemType {
  __typename: 'StatsItem'
  heading: string
  body?: string
  icon?: string
  media?: ContentfulImage
}

export function transformStatsItem(statsItem: Entry<any>): StatCardProps {
  const fields = statsItem.fields
  const { heading, body, icon, media } = fields

  const resolvedMedia = media ? resolveContentfulImage(media as ContentfulImage) : null
  let mediaElement = null

  if (resolvedMedia) {
    mediaElement = React.createElement(Image, {
      src: resolvedMedia.url,
      alt: resolvedMedia.alt,
      width: resolvedMedia.width,
      height: resolvedMedia.height,
      className: "w-full h-auto"
    })
  }

  return {
    type: 'stat',
    heading: heading as string,
    body: body as string,
    icon: icon as string,
    media: mediaElement,
    border: false,
    layout: 'left',
  }
}
