"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

export interface NewsItem {
  id: string
  image_url: string | null
  title: string
  description: string | null
  news_date: string  
  link: string | null
}


const AUTOPLAY_DELAY_MS = 5000

interface NewsCarouselProps {
  news: NewsItem[]
}

export function NewsCarousel({ news }: NewsCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())
    const onSelect = () => setCurrent(api.selectedScrollSnap())

    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  React.useEffect(() => {
    if (!api || news.length < 2) return

    const id = setInterval(() => {
      if (api.selectedScrollSnap() === api.scrollSnapList().length - 1) {
        api.scrollTo(0)
      } else {
        api.scrollNext()
      }
    }, AUTOPLAY_DELAY_MS)

    return () => clearInterval(id)
  }, [api, news.length])

  if (news.length === 0) {
    return (
      <div className="flex h-[420px] w-full items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
        No news yet.
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
        <CarouselContent>
          {news.map((item) => (
            <CarouselItem key={item.id}>
              <NewsSlide item={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {news.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "h-2 rounded-full transition-all",
              current === index
                ? "w-6 bg-white"
                : "w-2 bg-white/50 hover:bg-white/75"
            )}
          />
        ))}
      </div>
    </div>
  )
}

function NewsSlide({ item }: { item: NewsItem }) {
  console.log("image_url:", item.image_url)

  const slide = (
    <div className="relative h-[420px] w-full overflow-hidden bg-muted">
      {item.image_url ? (
        <Image
          src={item.image_url}
          alt={item.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10">
        <p className="text-xs font-medium uppercase tracking-wide text-white/70 sm:text-sm">
          {new Date(item.news_date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
          {item.title}
        </h2>
        {item.description ? (
          <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
            {item.description}
          </p>
        ) : null}
      </div>
    </div>
  )

  return item.link ? (
    <Link href={item.link} className="block">
      {slide}
    </Link>
  ) : (
    slide
  )
}