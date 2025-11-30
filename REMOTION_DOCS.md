---
image: /generated/articles-docs-getting-started.png
id: getting-started
title: Creating a new project
sidebar_label: Installation
slug: /
crumb: "Let's begin!"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Prerequisites

To use Remotion, you need at least [Node](https://nodejs.org/en/download/) <MinNodeVersion /> or [Bun](https://bun.sh) <MinBunVersion />.

## Scaffolding a new project

:::note
🐧 [Linux distros need at least version 2.35 of Libc.](https://github.com/remotion-dev/remotion/issues/2439)  
They also need to [install some additional packages](/docs/miscellaneous/linux-dependencies).  
Alpine Linux and nixOS are unsupported.
:::

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'bun', value: 'bun', },
{ label: 'pnpm', value: 'pnpm', },
{ label: 'yarn', value: 'yarn', },
]
}>
<TabItem value="npm">

```bash title="Use npm as the package manager"
npx create-video@latest
```

  </TabItem>
  <TabItem value="pnpm">

```bash title="Use pnpm as the package manager"
pnpm create video
```

  </TabItem>

  <TabItem value="yarn">

```bash title="Use Yarn as the package manager"
yarn create video
```

  </TabItem>

  <TabItem value="bun">

```bash title="Use Bun as the package manager and runtime"
bun create video
```

:::note
Bun as a runtime is mostly supported. [Read more here](/docs/bun).
:::

  </TabItem>
</Tabs>

Choose the template that is most suitable for you.  
For your first project, we recommend the [Hello World](/templates/hello-world) template.

<Tabs
defaultValue="npm"
values={[
{ label: 'Regular templates', value: 'npm', },
{ label: 'Next.js + React Router 7', value: 'pnpm', },
]
}>
<TabItem value="npm">

After the project has been scaffolded, we recommend to open the project in your text editor and starting the [Remotion Studio](/docs/studio):

```bash
npm run dev
```

  </TabItem>
  <TabItem value="pnpm">

After the project has been scaffolded, we recommend to open the project in your text editor and starting the app:

```bash
npm run dev
```

To start the [Remotion Studio](/docs/studio):

```bash
npm run remotion
```

  </TabItem>
</Tabs>

## Installation in existing projects

Want to install Remotion in an existing project? Go here instead: [Installation in existing projects](/docs/brownfield)
---
image: /generated/articles-docs-the-fundamentals.png
id: the-fundamentals
title: The fundamentals
crumb: Getting started
---

## React components

```twoslash include example
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const MyComposition = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontSize: 100,
        backgroundColor: "white",
      }}
    >
      The current frame is {frame}.
    </AbsoluteFill>
  );
};
// - MyComposition
```

The idea of Remotion is to give you a frame number and a blank canvas, to which you can render anything you want using [React](https://react.dev). This is an example React component that renders the current frame as text:

```tsx twoslash title="MyComposition.tsx"
// @include: example-MyComposition
```

A video is a function of images over time. If you change content every frame, you'll end up with an animation.

## Video properties

A video has 4 properties:

- `width` in pixels.
- `height` in pixels.
- `durationInFrames`: the total number of frames in the video.
- `fps`: framerate of the video.

You can obtain these values from the [`useVideoConfig()`](/docs/use-video-config) hook:

```tsx twoslash
import {AbsoluteFill, useVideoConfig} from 'remotion';

export const MyComposition = () => {
  const {fps, durationInFrames, width, height} = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 60,
        backgroundColor: 'white',
      }}
    >
      This {width}x{height}px video is {durationInFrames / fps} seconds long.
    </AbsoluteFill>
  );
};
```

:::note
A video's first frame is `0` and its last frame is `durationInFrames - 1`.
:::

## Compositions

A composition is the combination of a React component and video metadata.

By rendering a [`<Composition>`](/docs/composition) component in `src/Root.tsx`, you can register a renderable video and make it visible in the Remotion sidebar.

```tsx twoslash title="src/Root.tsx"
import {Composition} from 'remotion';
// @include: example-MyComposition
// ---cut---

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyComposition"
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      component={MyComposition}
    />
  );
};
```

:::note
You can register multiple compositions in `src/Root.tsx` by wrapping them in a React Fragment:  
`<><Composition/><Composition/></>`. See also: [How to combine compositions?](/docs/miscellaneous/snippets/combine-compositions)
:::
---
image: /generated/articles-docs-animating-properties.png
id: animating-properties
title: Animating properties
crumb: "The basics"
---

import {AnimatingProperties, Springs} from '../components/DocsDark'

Animation works by changing properties over time.  
Let's create a simple fade in animation.

If we want to fade the text in over 60 frames, we need to gradually change the `opacity` over time so that it goes from 0 to 1.

```tsx twoslash {4, 15} title="FadeIn.tsx"
import { AbsoluteFill, useCurrentFrame } from "remotion";
// ---cut---
export const FadeIn = () => {
  const frame = useCurrentFrame();

  const opacity = Math.min(1, frame / 60);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        fontSize: 80,
      }}
    >
      <div style={{ opacity: opacity }}>Hello World!</div>
    </AbsoluteFill>
  );
};
```

<AnimatingProperties />

## Using the interpolate helper function

Using the [`interpolate()`](/docs/interpolate) function can make animations more readable. The above animation can also be written as:

```tsx twoslash
import { useCurrentFrame } from "remotion";
const frame = useCurrentFrame();
// ---cut---
import { interpolate } from "remotion";

const opacity = interpolate(frame, [0, 60], [0, 1], {
  /*                        ^^^^^   ^^^^^    ^^^^
  Variable to interpolate ----|       |       |
  Input range ------------------------|       |
  Output range -------------------------------|  */
  extrapolateRight: "clamp",
});
```

In this example, we map the frames 0 to 60 to their opacity values `(0, 0.0166, 0.033, 0.05 ...`) and use the [`extrapolateRight`](/docs/interpolate#extrapolateright) setting to clamp the output so that it never becomes bigger than 1.

## Using spring animations

Spring animations are a natural animation primitive. By default, they animate from 0 to 1 over time. This time, let's animate the scale of the text.

```tsx twoslash {7-12, 20}
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const MyVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
  });

  return (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        fontSize: "7em",
      }}
    >
      <div style={{ transform: `scale(${scale})` }}>Hello World!</div>
    </div>
  );
};
```

You should see the text jump in.

<Springs />
<br />

The default spring configuration leads to a little bit of overshoot, meaning the text will bounce a little bit. See the documentation page for [`spring()`](/docs/spring) to learn how to customize it.

## Always animate using `useCurrentFrame()`

Watch out for flickering issues during rendering that arise if you write animations that are not driven by [`useCurrentFrame()`](/docs/use-current-frame) – for example CSS transitions.

[Read more about how Remotion's rendering works](/docs/flickering) - understanding it will help you avoid issues down the road.
---
image: /generated/articles-docs-sequences.png
id: reusability
title: Making components reusable
sidebar_label: Reuse components
crumb: 'The power of React'
---

```twoslash include example
import {interpolate, useCurrentFrame, AbsoluteFill} from 'remotion'

const Title: React.FC<{title: string}> = ({title}) => {
    const frame = useCurrentFrame()
    const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'})

    return (
      <div style={{opacity, textAlign: "center", fontSize: "7em"}}>{title}</div>
    );
}
// - Title
```

React components allow us to encapsulate video logic and reuse the same visuals multiple times.

Consider a title - to make it reusable, factor it out into its own component:

```tsx twoslash title="MyComposition.tsx"
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

const Title: React.FC<{title: string}> = ({title}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{opacity, textAlign: 'center', fontSize: '7em'}}>{title}</div>
  );
};

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Title title="Hello World" />
    </AbsoluteFill>
  );
};
```

To render multiple instances of the title, duplicate the `<Title>` component.

You can also use the [`<Sequence>`](/docs/sequence) component to limit the duration of the first title and time-shift the appearance of the second title.

```tsx twoslash
// @include: example-Title
// ---cut---
import {Sequence} from 'remotion';

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={40}>
        <Title title="Hello" />
      </Sequence>
      <Sequence from={40}>
        <Title title="World" />
      </Sequence>
    </AbsoluteFill>
  );
};
```

You should see two titles appearing after each other.

Note that the value of [`useCurrentFrame()`](/docs/use-current-frame) has been shifted in the second instance, so that it returns `0` only when the absolute time is `40`. Before that, the sequence was not mounted at all.

Sequences by default are absolutely positioned - you can use [`layout="none"`](/docs/sequence#layout) to make them render like a regular `<div>`.

## See also

- [`<Sequence>` component](/docs/sequence)
- [How do I combine compositions?](/docs/miscellaneous/snippets/combine-compositions)
---
image: /generated/articles-docs-preview.png
title: Preview your video
id: preview
crumb: 'Timeline basics'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

You can preview your video by starting the [Remotion Studio](/docs/studio):

<Tabs
defaultValue="Regular templates"
values={[
{ label: 'Regular templates', value: 'Regular templates', },
{ label: 'Next.js and React Router 7 templates', value: 'Next.js and React Router templates', },
]
}>
<TabItem value="Regular templates">

```bash
npm run dev
```

  </TabItem>

  <TabItem value="Next.js and React Router templates">

```bash
npm run remotion
```

  </TabItem>
</Tabs>

This is a shorthand for the [`studio`](/docs/cli/studio) command of the [Remotion CLI](/docs/cli):

```bash
npx remotion studio
```

A server will be started on port `3000` (or a higher port if it isn't available) and the Remotion Studio should open in the browser.

<img src="/img/timeline.png"></img>

Learn more about the [Remotion Studio](/docs/studio).

:::note
In older projects, `npm start` was used over `npm run dev`.
:::
---
image: /generated/articles-docs-transforms.png
id: transforms
title: Transforms
crumb: "The fundamentals"
---

import {Transforms} from '../components/DocsDark'
import {MuxVideo} from '../src/components/MuxVideo';
import {TransformsTutorial} from '../src/components/tutorials';

<TransformsTutorial />
Animation occurs when the visual properties of an element transform over time.  
Let's look at five common ways to transform an element.

Already familiar with how to apply CSS transforms in React? [Skip this page](/docs/animating-properties).

## The 5 basic transformations

<Transforms />

<p align="center" style={{
  fontStyle: "italic",
  fontSize: "0.9em",
  marginTop: 10
}}>From left to right: Opacity, Scale, Skew, Translate, Rotate</p>

### Opacity

The opacity determines how visible the element is. `0` means fully invisible, `1` means fully visible. Values inbetween will make the element semi-transparent, and elements underneath will be visible.

You can set the opacity of an element using the `opacity` property.

```tsx twoslash {6} title="MyComponent.tsx"
<div
  style={{
    height: 100,
    width: 100,
    backgroundColor: "red",
    opacity: 0.5,
  }}
/>
```

<Demo type="opacity" />

Values below `0` and above `1` are accepted, but have no further effect.

### Scale

The scale determines how big an element is. `1` is the natural size, `2` will make the element twice as tall and wide.  
Values below `1` will make the element smaller. `0` makes the element invisible. Values below `0` are accepted and will make the element bigger again, but mirrored.

You can set the scale of an element using the `transform` property.

```tsx twoslash {6} title="MyComponent.tsx"
<div
  style={{
    height: 100,
    width: 100,
    backgroundColor: "red",
    transform: `scale(0.5)`,
  }}
/>
```

<Demo type="scale" />

The difference to changing the size of the element using `height` and `width` is that using `scale()` will not change the layout of the other elements.

### Skew

Skewing an element will lead to a distorted appearance as if the the element has been stretched on two corners of the element. Skew takes an angle that can be specified using `rad` (radians) and `deg` (degrees).

You can set the skew of an element using the `transform` property.

See the explorer below to see how skewing affects an element.

```tsx twoslash {6} title="MyComponent.tsx"
<div
  style={{
    height: 100,
    width: 100,
    backgroundColor: "red",
    transform: `skew(20deg)`,
  }}
/>
```

<Demo type="skew" />

### Translate

Translating an element means moving it. A translation can be done on the X, Y or even Z axis. The transformation can be specified in `px`.

You can set the translation of an element using the `transform` property.

```tsx twoslash {6} title="MyComponent.tsx"
<div
  style={{
    height: 100,
    width: 100,
    backgroundColor: "red",
    transform: `translateX(100px)`,
  }}
/>
```

<Demo type="translate" />

As opposed to changing the position of an element using `margin-top` and `margin-left`, using `translate()` will not change the position of the other elements.

### Rotate

By rotating an element, you can make it appear as if it has been turned around its center. The rotation can be specified in `rad` (radians) or `deg` (degrees) and you can rotate an element around the Z axis (the default) but also around the X and Y axis.

You can set the translation of an element using the `transform` property.

```tsx twoslash {6} title="MyComponent.tsx"
<div
  style={{
    height: 100,
    width: 100,
    backgroundColor: "red",
    transform: `rotate(45deg)`, // the same as rotateZ(45deg)
  }}
/>
```

<Demo type="rotate" />

If you want to rotate an element around the X or Y axis, you should apply the [`perspective`](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective) property to the parent element.

If you don't want to rotate around the center, you can use the [`transform-origin`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin) property to change the origin of the rotation.

Note that when rotating SVG elements, the transform origin is the top left corner by default. You can get the same behavior as for the other elements by adding `style={{transformBox: 'fill-box', transformOrigin: 'center center'}}`.

## Multiple transformations

Oftentimes, you want to combine multiple transformations. If they use different CSS properties like `transform` and `opacity`, simply specify both properties in the `style` object.

If both transformations use the `transform` property, specify multiple transformations separated by a space.

```tsx twoslash {6} title="MyComponent.tsx"
<div
  style={{
    height: 100,
    width: 100,
    backgroundColor: "red",
    transform: `translateX(100px) scale(2)`,
  }}
/>
```

Note that the order matters. The transformations are applied in the order they are specified.

## Using the `makeTransform()` helper

Install [@remotion/animation-utils](/docs/animation-utils/) to [get a type-safe helper function](/docs/animation-utils/make-transform) to generate `transform` strings.

```tsx twoslash
import { makeTransform, rotate, translate } from "@remotion/animation-utils";

const transform = translate(50, 50);
// => "translate(50px, 50px)"

const multiTransform = makeTransform([rotate(45), translate(50, 50)]);
// => "rotate(45deg) translate(50px, 50px)"
```

## More ways to transform objects

These are just some of the basic transformations. Here are some more transformations that are possible:

- The height and width of a `<div>`
- The rounded edges of an element using `border-radius`
- The shadow of an element using `box-shadow`
- The color of something using `color` and [`interpolateColors()`](/docs/interpolate-colors)
- The evolution of a SVG path using [`evolvePath()`](/docs/paths/evolve-path)
- The weight and slant of a [dynamic font](https://twitter.com/JNYBGR/status/1598983409367683072)
- The stops of a `linear-gradient`
- The values of a CSS `filter()`
---
image: /generated/articles-docs-importing-assets.png
id: assets
title: Importing assets
sidebar_label: Assets
crumb: 'How To'
---

To import assets in Remotion, create a `public/` folder in your project and use [`staticFile()`](/docs/staticfile) to import it.

```txt
my-video/
├─ node_modules/
├─ public/
│  ├─ logo.png
├─ src/
│  ├─ MyComp.tsx
│  ├─ Root.tsx
│  ├─ index.ts
├─ package.json
```

```tsx twoslash title="src/MyComp.tsx"
import {Img, staticFile} from 'remotion';

export const MyComp: React.FC = () => {
  return <Img src={staticFile('logo.png')} />;
};
```

## Using images

Use the [`<Img/>`](/docs/img) tag from Remotion.

```tsx twoslash title="MyComp.tsx"
import {Img, staticFile} from 'remotion';

export const MyComp: React.FC = () => {
  return <Img src={staticFile('logo.png')} />;
};
```

You can also pass a URL:

```tsx twoslash title="MyComp.tsx"
import {Img} from 'remotion';

export const MyComp: React.FC = () => {
  return <Img src="https://picsum.photos/id/237/200/300" />;
};
```

## Using image sequences

If you have a series of images, for example exported from another program like After Effects or Rotato, you can interpolate the path to create a dynamic import.

```txt
my-video/
├─ public/
│  ├─ frame1.png
│  ├─ frame2.png
│  ├─ frame3.png
├─ package.json
```

```tsx twoslash
import {Img, staticFile, useCurrentFrame} from 'remotion';

const MyComp: React.FC = () => {
  const frame = useCurrentFrame();

  return <Img src={staticFile(`/frame${frame}.png`)} />;
};
```

## Using videos

Use the [`<OffthreadVideo />`](/docs/offthreadvideo), [`<Video />`](/docs/media/video) or [`<Html5Video />`](/docs/html5-video) component to keep the timeline and your video in sync.

```tsx twoslash
import {OffthreadVideo, staticFile} from 'remotion';

export const MyComp: React.FC = () => {
  return <OffthreadVideo src={staticFile('vid.webm')} />;
};
```

Loading videos via URL is also possible:

```tsx twoslash
import {OffthreadVideo} from 'remotion';

export const MyComp: React.FC = () => {
  return <OffthreadVideo src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />;
};
```

See also: [Which video formats does Remotion support?](/docs/miscellaneous/video-formats)

## Using Audio

Use the [`<Html5Audio>`](/docs/html5-audio) component.

```tsx twoslash
import {Html5Audio, staticFile} from 'remotion';

export const MyComp: React.FC = () => {
  return <Html5Audio src={staticFile('tune.mp3')} />;
};
```

Loading audio from an URL is also possible:

```tsx twoslash
import {Html5Audio} from 'remotion';

export const MyComp: React.FC = () => {
  return <Html5Audio src="https://file-examples.com/storage/fe48a63c5264cbd519788b3/2017/11/file_example_MP3_700KB.mp3" />;
};
```

See the [audio guide](/docs/using-audio) for guidance on including audio.

## Using CSS

Put the .css file alongside your JavaScript source files and use an `import` statement.

```txt
my-video/
├─ node_modules/
├─ src/
│  ├─ style.css
│  ├─ MyComp.tsx
│  ├─ Root.tsx
│  ├─ index.ts
├─ package.json
```

```tsx twoslash title="MyComp.tsx"
import './style.css';
```

:::note
Want to use SASS, Tailwind or similar? [See examples on how to override the Webpack configuration](/docs/webpack).
:::

## Using Fonts

[Read the separate page for fonts.](/docs/fonts)

## `import` statements

As an alternative way to import files, Remotion allows you to `import` or `require()` several types of files in your project:

- Images (`.png`, `.svg`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.bmp`)
- Videos (`.webm`, `.mov`, `.mp4`)
- Audio (`.mp3`, `.wav`, `.aac`, `.m4a`)
- Fonts (`.woff`, `.woff2`, `.otf`, `.ttf`, `.eot`)

For example:

```tsx twoslash title="MyComp.tsx"
import {Img} from 'remotion';
import logo from './logo.png';

export const MyComp: React.FC = () => {
  return <Img src={logo} />;
};
```

### Caveats

While this was previously the main way of importing files, we now recommend against it because of the following reasons:

- Only the above listed file extensions are supported.
- The maximum file size is 2GB.
- Dynamic imports such as `require('img' + frame + '.png')` are [funky](/docs/webpack-dynamic-imports).

Prefer importing using [`staticFile()`](/docs/staticfile) if possible.

## Dynamic duration based on assets

To make your videos duration dependent based on your assets, see: [Dynamic duration, FPS & dimensions](/docs/dynamic-metadata)

## Files outside of the project

Remotion runs in the browser, so it does not have access to arbitrary files on your computer.  
It is also not possible to use the `fs` module from Node.js in the browser.  
Instead, put assets in the `public/` folder and use [`getStaticFiles()`](/docs/getstaticfiles) to enumerate them.

See [why does Remotion does not support absolute paths](/docs/miscellaneous/absolute-paths).

## Adding assets after bundling

Before rendering, the code gets bundled using Webpack, and only bundled assets can be accessed afterwards.  
For this reason, assets that are being added to the public folder after [`bundle()`](/docs/bundle) is called will not be accessible during render.  
However, if you use the [server-side rendering APIs](/docs/ssr-node), you can add assets to the `public` folder that is inside the bundle after the fact.

## Use `<Img>`, `<Video>` and `<Audio>`

**Use [`<Img />`](/docs/img) or [`<Gif />`](/docs/gif)** over the native `<img>` tag, `<Image>` from Next.js and CSS `background-image`.  
**Use [`<OffthreadVideo />`](/docs/offthreadvideo), [`<Video />`](/docs/media/video) or [`<Html5Video />`](/docs/html5-video)** over the native `<video>` tag.  
**Use [`<Audio />`](/docs/media/audio) or [`<Html5Audio />`](/docs/html5-audio)** over the native `<audio>` tag.  
**Use [`<IFrame />`](/docs/iframe)** over the native `<iframe>` tag.

<br />

By using the components from Remotion, you ensure that:

<Step>1</Step> The assets are fully loaded before the the frame is rendered
<br />
<Step>2</Step> The images and videos are synchronized with Remotion's timeline.

## See also

- [staticFile()](/docs/staticfile)
- [getStaticFiles()](/docs/getstaticfiles)
- [watchStaticFile()](/docs/watchstaticfile)
- [Why Remotion does not support absolute paths](/docs/miscellaneous/absolute-paths)
---
image: /generated/articles-docs-layers.png
id: layers
title: Layers
crumb: 'Designing videos'
---

Unlike normal websites, a video has fixed dimensions. That means, it is okay to use `position: "absolute"`!

In Remotion, you often want to "layer" elements on top of each other.  
This is a common pattern in video editors, and in Photoshop.

An easy way to do it is using the [`<AbsoluteFill>`](/docs/absolute-fill) component:

```tsx twoslash title="MyComp.tsx"
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

export const MyComp: React.FC = () => {
  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Img src={staticFile('bg.png')} />
      </AbsoluteFill>
      <AbsoluteFill>
        <h1>This text appears on top of the video!</h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

This will render the text on top of the image.

If you want to only show an element for a certain duration, you can use a [`<Sequence>`](/docs/sequence) component, which by default is also absolutely positioned.

```tsx twoslash title="MyComp.tsx"
import React from 'react';
import {AbsoluteFill, Img, staticFile, Sequence} from 'remotion';

export const MyComp: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence>
        <Img src={staticFile('bg.png')} />
      </Sequence>
      <Sequence from={60} durationInFrames={40}>
        <h1>This text appears after 60 frames!</h1>
      </Sequence>
    </AbsoluteFill>
  );
};
```

The lower the absolutely positioned element is in the tree, the higher it will be in the layer stack.  
If you are aware of this behavior, you can use it to your advantage and avoid using `z-index` in most cases.

## See also

- [`<AbsoluteFill>`](/docs/absolute-fill)
- [`<Sequence>`](/docs/sequence)
- [Build a timeline-based video editor](/docs/building-a-timeline)
---
image: /generated/articles-docs-transitions.png
id: transitioning
title: Transitions
crumb: "Techniques"
---

# Transitions<AvailableFrom v="4.0.59"/>

import { TransitionsDuration } from "../components/TransitionsDuration";
import { Presentations } from "../components/TableOfContents/transitions/presentations";
import { Timings } from "../components/TableOfContents/transitions/timings";

To transition between two types of absolutely positioned content, you can use the [`<TransitionSeries>`](/docs/transitions/transitionseries) component.

```tsx twoslash title="SlideTransition.tsx"
import { AbsoluteFill } from "remotion";

const Letter: React.FC<{
  children: React.ReactNode;
  color: string;
}> = ({ children, color }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity: 0.9,
        justifyContent: "center",
        alignItems: "center",
        fontSize: 200,
        color: "white",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
// ---cut---
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";

const BasicTransition = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={40}>
        <Letter color="#0b84f3">A</Letter>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide()}
        timing={linearTiming({ durationInFrames: 30 })}
      />
      <TransitionSeries.Sequence durationInFrames={60}>
        <Letter color="pink">B</Letter>
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

<Demo type="slide" />

## Enter and exit animations

You don't necessarily have to use `<TransitionSeries>` for transitions between scenes. You can also use it to animate the entrace or exit of a scene by putting a transition first or last in the `<TransitionSeries>`.

[See example](/docs/transitions/transitionseries#enter-and-exit-animations)

## Duration

In the above example, `A` is visible for 40 frames, `B` for 60 frames and the duration of the transition is 30 frames.  
During this time, both slides are rendered. This means the total duration of the animation is `60 + 40 - 30 = 70`.

<TransitionsDuration />

## Presentations

A presentation determines the visual of animation.

<Presentations />

## Timings

A timing determines how long the animation takes and the animation curve.

<Timings />

## Audio transitions

See here how to include [audio effects](/docs/transitions/audio-transitions) in your transitions.

## Getting the duration of a transition

You can get the duration of a transition by calling `getDurationInFrames()` on the timing:

```tsx twoslash title="Assuming a framerate of 30fps"
import { springTiming } from "@remotion/transitions";

springTiming({ config: { damping: 200 } }).getDurationInFrames({ fps: 30 }); // 23
```

## Rules

<Step>1</Step> It is forbidden to have a transition that is longer than the duration
of the previous or next sequence. <br />
<Step>2</Step> There can be no two transitions next to each other. <br />
<Step>3</Step> There must be at least one sequence before or after a transition.

## See also

- [`@remotion/transitions`](/docs/transitions)
- [`<TransitionSeries>`](/docs/transitions/transitionseries)
---
image: /generated/articles-docs-fonts.png
title: Using fonts
sidebar_label: Fonts
id: fonts
crumb: "Techniques"
---

Here are some ways how you can use custom fonts in Remotion.

## Google Fonts using `@remotion/google-fonts`

_available from v3.2.40_

[`@remotion/google-fonts`](/docs/google-fonts) is a type-safe way to load Google fonts without having to create CSS files.

```tsx title="MyComp.tsx"
import { loadFont } from "@remotion/google-fonts/TitanOne";

const { fontFamily } = loadFont();

const GoogleFontsComp: React.FC = () => {
  return <div style={{ fontFamily }}>Hello, Google Fonts</div>;
};
```

## Google Fonts using CSS

Import the CSS that Google Fonts gives you.

:::note
From version 2.2 on, Remotion will automatically wait until the fonts are loaded.  
:::

```css title="font.css"
@import url("https://fonts.googleapis.com/css2?family=Bangers");
```

```tsx twoslash title="MyComp.tsx"
import "./font.css";

const MyComp: React.FC = () => {
  return <div style={{ fontFamily: "Bangers" }}>Hello</div>;
};
```

## Local fonts using `@remotion/fonts`

_available from v4.0.164_

Put the font into your `public/` folder.  
Put the [`loadFont()`](/docs/fonts-api/load-font) call somewhere in your app where it gets executed:

```tsx twoslash title="load-fonts.ts"
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const fontFamily = "Inter";

loadFont({
  family: fontFamily,
  url: staticFile("Inter-Regular.woff2"),
  weight: "500",
}).then(() => {
  console.log("Font loaded!");
});
```

The font is now available for use:

```tsx twoslash title="MyComp.tsx"
const fontFamily = "Inter";

// ---cut---

<div style={{ fontFamily: fontFamily }}>Some text</div>;
```

## Local fonts (manually)

You may load fonts by using the web-native [`FontFace`](https://developer.mozilla.org/en-US/docs/Web/API/FontFace) API.

```tsx twoslash title="load-fonts.ts"
import { continueRender, delayRender, staticFile } from "remotion";

const waitForFont = delayRender();
const font = new FontFace(
  `Bangers`,
  `url('${staticFile("bangers.woff2")}') format('woff2')`,
);

font
  .load()
  .then(() => {
    document.fonts.add(font);
    continueRender(waitForFont);
  })
  .catch((err) => console.log("Error loading font", err));
```

:::note
If your Typescript types give errors, install the newest version of the `@types/web` package.
:::
---
image: /generated/articles-docs-measuring.png
id: measuring
title: Measuring DOM nodes
sidebar_label: Measuring items
crumb: "How To"
---

If you want to measure a DOM node, you can assign a [React Ref](https://react.dev/learn/manipulating-the-dom-with-refs) to it and then use the [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect?retiredLocale=de) browser API to get the position and size of the node.

In Remotion, it is not that easy because the `<div>` element in which the video is rendered into has a `scale()` transform applied to it, which affects the value that you get from `getBoundingClientRect()`.

## Measure using the `useCurrentScale()` hook

From v4.0.111 on, you can use the [`useCurrentScale()`](/docs/use-current-scale) hook to correct the dimensions of the element.

```tsx twoslash title="MyComponent.tsx"
import { useCallback, useEffect, useState, useRef } from "react";
import { useCurrentScale } from "remotion";

export const MyComponent = () => {
  const ref = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState<{
    correctedHeight: number;
    correctedWidth: number;
  } | null>(null);

  const scale = useCurrentScale();

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();

    setDimensions({
      correctedHeight: rect.height / scale,
      correctedWidth: rect.width / scale,
    });
  }, [scale]);

  return (
    <div>
      <div ref={ref}>Hello World!</div>
    </div>
  );
};
```

## Versions prior to v4.0.110

To get an accurate measurement, you can render an additional element with a fixed width (say `10px`) and measure it too. Then, you can divide the width of the element by `10` to get the scale factor.

```tsx twoslash title="MyComponent.tsx"
import { useCallback, useEffect, useState, useRef } from "react";

const MEASURER_SIZE = 10;

export const MyComponent = () => {
  const ref = useRef<HTMLDivElement>(null);
  const measurer = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState<{
    correctedHeight: number;
    correctedWidth: number;
  } | null>(null);

  useEffect(() => {
    if (!ref.current || !measurer.current) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const measurerRect = measurer.current.getBoundingClientRect();
    const scale = measurerRect.width / MEASURER_SIZE;

    setDimensions({
      correctedHeight: rect.height * scale,
      correctedWidth: rect.width * scale,
    });
  }, []);

  return (
    <div>
      <div ref={ref}>Hello World!</div>
      <div
        ref={measurer}
        style={{
          width: MEASURER_SIZE,
          position: "fixed",
          top: -99999,
        }}
      />
    </div>
  );
};
```

### Example project

- [Source code](https://github.com/remotion-dev/measure-item)
- [Preview](https://measure-item.vercel.app)

## Versions prior to v4.0.103

In previous versions of Remotion, `getBoundingClientRect()` could return dimensions with all values being `0` in the first `useEffect()` due to mounting your component but not showing it.

Going forward, you can rely on the dimensions being non-zero.

## See also

- [react-use-measure](https://github.com/pmndrs/react-use-measure) - Measure elements correctly inside a scroll container
---
image: /generated/articles-docs-using-randomness.png
id: using-randomness
sidebar_label: Randomness
title: Using randomness
crumb: "Roll the dice"
---

The following thing is an anti-pattern in Remotion:

```tsx twoslash
import { useState } from "react";
// ---cut---
const MyComp: React.FC = () => {
  const [randomValues] = useState(() =>
    new Array(10).fill(true).map((a, i) => {
      return {
        x: Math.random(),
        y: Math.random(),
      };
    }),
  );
  // Do something with coordinates
  return <></>;
};
```

While this will work during preview, it will break while rendering. The reason is that Remotion is spinning up multiple instances of the webpage to render frames in parallel, and the random values will be different on every instance.

## Fixing the problem

Use the [`random()`](/docs/random) API from Remotion to get deterministic pseudorandom values. Pass in a seed (number or string) and as long as the seed is the same, the return value will be the same.

```tsx twoslash {5-6}
import { random } from "remotion";
const MyComp: React.FC = () => {
  // No need to use useState
  const randomValues = new Array(10).fill(true).map((a, i) => {
    return {
      x: random(`x-${i}`),
      y: random(`y-${i}`),
    };
  });

  return <></>;
};
```

Now the random values will be the same on all threads.

## False positives

Did you get an ESLint warning when using `Math.random()`, but you are fully aware of the circumstances described above? Use `random(null)` to get a true random value without getting a warning.

## Exception: Inside `calculateMetadata()`

It is safe to use true random values inside [`calculateMetadata()`](/docs/calculate-metadata), as it is only called once and not in parallel.

## See also

- [`random()`](/docs/random)
---
image: /generated/articles-docs-noise-visualization.png
title: Noise visualization
id: noise-visualization
crumb: "Techniques"
---

Using the [`@remotion/noise`](/docs/noise) package, you can add noise for your videos.

## Noise Dot Grid Demo

This example shows how to create a floating dot grid "surface" using [`noise3D()`](/docs/noise/noise-3d) function.

- 1st and 2nd dimensions used for space domain.
- 3rd dimension used for time domain.

<Demo type="noise"/>

```tsx twoslash
import { noise3D } from "@remotion/noise";
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const OVERSCAN_MARGIN = 100;
const ROWS = 10;
const COLS = 15;

const NoiseComp: React.FC<{
  speed: number;
  circleRadius: number;
  maxOffset: number;
}> = ({ speed, circleRadius, maxOffset }) => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();

  return (
    <svg width={width} height={height}>
      {new Array(COLS).fill(0).map((_, i) =>
        new Array(ROWS).fill(0).map((__, j) => {
          const x = i * ((width + OVERSCAN_MARGIN) / COLS);
          const y = j * ((height + OVERSCAN_MARGIN) / ROWS);
          const px = i / COLS;
          const py = j / ROWS;
          const dx = noise3D("x", px, py, frame * speed) * maxOffset;
          const dy = noise3D("y", px, py, frame * speed) * maxOffset;
          const opacity = interpolate(
            noise3D("opacity", i, j, frame * speed),
            [-1, 1],
            [0, 1]
          );

          const key = `${i}-${j}`;

          return (
            <circle
              key={key}
              cx={x + dx}
              cy={y + dy}
              r={circleRadius}
              fill="gray"
              opacity={opacity}
            />
          );
        })
      )}
    </svg>
  );
};
```

## See also

- [`@remotion/noise`](/docs/noise)
---
image: /generated/articles-docs-animation-math.png
title: Animation math
crumb: "Techniques"
---

You can add, subtract and multiply animation values to create more complex animations.  
Consider the following example:

```tsx twoslash title="Enter and exit"
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps, durationInFrames } = useVideoConfig();

const enter = spring({
  fps,
  frame,
  config: {
    damping: 200,
  },
});

const exit = spring({
  fps,
  config: {
    damping: 200,
  },
  durationInFrames: 20,
  delay: durationInFrames - 20,
  frame,
});

const scale = enter - exit;
```

- At the beginning of the animation, the value of `enter` is `0`, it goes to `1` over the course of the animation.
- Before the sequence ends, we create an `exit` animation that goes from `0` to `1`.
- Subtracting the `exit` animation from the `enter` animation gives us the overall state of the animation which we use to animate `scale`.

<Demo type="animation-math" />

```tsx twoslash title="Full snippet"
import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const AnimationMath: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
  });

  const exit = spring({
    fps,
    config: {
      damping: 200,
    },
    durationInFrames: 20,
    delay: durationInFrames - 20,
    frame,
  });

  const scale = enter - exit;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          height: 100,
          width: 100,
          backgroundColor: "#4290f5",
          borderRadius: 20,
          transform: `scale(${scale})`,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          fontSize: 50,
          color: "white",
        }}
      >
        {frame}
      </div>
    </AbsoluteFill>
  );
};
```
---
image: /generated/articles-docs-tailwind.png
id: tailwind
title: TailwindCSS
crumb: 'text-lg font-bold'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {TailwindSupport} from '../components/TailwindSupport';

## Using the CLI

The easiest way to get started with Tailwind is by scaffolding a new video using the CLI and selecting a template that supports adding Tailwind automatically.

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'bun', value: 'bun', },
{ label: 'pnpm', value: 'pnpm', },
{ label: 'yarn', value: 'yarn', },
]
}>
<TabItem value="npm">

```bash
npx create-video@latest
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm create video
```

  </TabItem>
  <TabItem value="bun">

```bash
bun create video
```

  </TabItem>
  <TabItem value="yarn">

```bash
yarn create video
```

  </TabItem>

</Tabs>

The following templates support scaffolding with TailwindCSS: <TailwindSupport />

## Installing Tailwind v4 in existing project

_from v4.0.256_

1. Install [`@remotion/tailwind-v4`](/docs/tailwind-v4/overview) package and TailwindCSS dependencies.

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
{ label: 'bun', value: 'bun', },
]
}>
<TabItem value="npm">

```bash
npm i -D @remotion/tailwind-v4 tailwindcss
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add -D @remotion/tailwind-v4 tailwindcss
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm i -D @remotion/tailwind-v4 tailwindcss
```

  </TabItem>
  <TabItem value="bun">

```bash
bun i -D @remotion/tailwind-v4 tailwindcss
```

  </TabItem>
</Tabs>

2. Add the Webpack override from `@remotion/tailwind-v4` to your config file:

```ts twoslash title="remotion.config.ts"
import {Config} from '@remotion/cli/config';
import {enableTailwind} from '@remotion/tailwind-v4';

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration);
});
```

3. If you use the [`bundle()` or `deploySite()` Node.JS API, add the Webpack override to it as well](/docs/webpack#when-using-bundle-and-deploysite).

4. Create a file `postcss.config.mjs` with the following content:

```css title="postcss.config.mjs"
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

5. Create a file `src/index.css` with the following content:

```css title="src/index.css"
@import 'tailwindcss';
```

5. Import the stylesheet in your `src/Root.tsx` file. Add to the top of the file:

```js title="src/Root.tsx"
import './index.css';
```

7. Ensure your `package.json` does not have `"sideEffects": false` set. If it has, declare that CSS files have a side effect:

```diff title="package.json"
{
// Only if `"sideEffects": false` exists in your package.json.
-  "sideEffects": false
+  "sideEffects": ["*.css"]
}
```

8. Start using TailwindCSS! You can verify that it's working by adding `className="bg-red-900"` to any element.

## Installing Tailwind v3 in existing project

_from v3.3.95, see [instructions for older versions](https://github.com/remotion-dev/remotion/blob/88a5d8d17f50d6ab2b8a408556118d15a3686343/packages/docs/docs/tailwind.md)_

1. Install [`@remotion/tailwind`](/docs/tailwind/tailwind) package and TailwindCSS dependencies.

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
{ label: 'bun', value: 'bun', },
]
}>
<TabItem value="npm">

```bash
npm i -D @remotion/tailwind
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add -D @remotion/tailwind
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm i -D @remotion/tailwind
```

  </TabItem>
  <TabItem value="bun">

```bash
bun i -D @remotion/tailwind
```

  </TabItem>
</Tabs>

2. Add the Webpack override from `@remotion/tailwind` to your config file:

```ts twoslash title="remotion.config.ts"
import {Config} from '@remotion/cli/config';
import {enableTailwind} from '@remotion/tailwind';

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration);
});
```

:::note
Prior to `v3.3.39`, the option was called `Config.Bundling.overrideWebpackConfig()`.
:::

3. If you use the [`bundle()` or `deploySite()` Node.JS API, add the Webpack override to it as well](/docs/webpack#when-using-bundle-and-deploysite).

4. Create a file `src/style.css` with the following content:

```css title="src/style.css"
@tailwind base;
@tailwind components;
@tailwind utilities;
```

5. Import the stylesheet in your `src/Root.tsx` file. Add to the top of the file:

```js title="src/Root.tsx"
import './style.css';
```

6. Add a `tailwind.config.js` file to the root of your project:

```js title="tailwind.config.js"
/* eslint-env node */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

7. Ensure your `package.json` does not have `"sideEffects": false` set. If it has, declare that CSS files have a side effect:

```diff title="package.json"
{
// Only if `"sideEffects": false` exists in your package.json.
-  "sideEffects": false
+  "sideEffects": ["*.css"]
}
```

8. Start using TailwindCSS! You can verify that it's working by adding `className="bg-red-900"` to any element.

:::note
Your package manager might show a peer dependency warning. You can safely ignore it or add `strict-peer-dependencies=false` to your `.npmrc` to suppress it.
:::

## See also

- [TailwindCSS v2 (legacy)](/docs/tailwind-legacy)
