import { useEffect } from 'react';

const lessons = [
  {
    title: 'Lesson 1. Creating an Image in Higgsfield',
    youtubeId: '6xfbIwV1eEQ',
    text: `Lesson 1. Creating an Image in Higgsfield

In this lesson, you will learn how to create an image in Higgsfield, from generating a prompt to downloading the final result.

Step 1. Create a Prompt

Before using Higgsfield, you need to prepare a detailed prompt. Open ChatGPT. Describe the image you would like to create. Specify that you need both photo and video prompts. Once the prompts are generated, copy the photo prompt for use in Higgsfield.

Step 2. Open the Create Image Section

Open Higgsfield. On the main page, click Create Image.

Step 3. Add Your Prompt

Paste the photo prompt into the prompt field. If needed, upload a reference image to guide the generation process.

Step 4. Choose a Generation Model

Higgsfield offers several image generation models. You can experiment with different models to find the one that best suits your needs. For most projects, Nano Banana Pro is recommended because it provides an excellent balance between quality, performance, and cost.

Step 5. Adjust Image Settings

Before generating the image, configure the desired settings.
Aspect Ratio Options:
- 16:9 - Landscape format
- 9:16 - Portrait format
- 1:1 - Square format
For this example, we use 16:9. You can also adjust additional settings, such as Image quality and Other available generation parameters.

Step 6. Generate the Image

After configuring all settings, click Generate and wait for the image creation process to finish.

Step 7. Download the Result

Once the image has been generated:

Review the final result. Click Download to save the image to your device.

You have now successfully created and downloaded an image using Higgsfield.`,
  },
  {
    title: 'Lesson 2. Creating a Video in Higgsfield',
    youtubeId: 'kuDy_aKJPo4',
    text: `Lesson 2. Creating a Video in Higgsfield

In this lesson, you will learn how to turn a generated image into a video using Higgsfield.

Step 1. Prepare Your Image

Before creating a video, make sure you have already generated and downloaded an image. Download the image created in the previous lesson. Save it to your device for use as the source image.

Step 2. Open the Create Video Section

Open Higgsfield. Navigate to the Create Video section.

Step 3. Upload Your Image

Upload the image you generated earlier. Wait for the image to load completely before proceeding.

Step 4. Choose a Video Generation Model

Higgsfield offers several video generation models. For this tutorial, we will use Kling 3.0. Alternative option Kling 2.5 Turbo is also available. This model is a good choice for beginners because it is more affordable while still delivering solid results. Feel free to experiment with different models depending on your project requirements and available credits.

Step 5. Create a Video Prompt

Open ChatGPT. Generate a video prompt based on the image and desired motion. Copy the video prompt.

Step 6. Add the Prompt

Return to Higgsfield. Paste the video prompt into the prompt field.

Step 7. Select the Resolution

Higgsfield provides different output resolutions.
Available options may include:
- 720p
- 1080p

For beginners, 720p is recommended because:
- It requires fewer credits.
- The generation process is generally faster and more stable.
- It helps avoid common generation issues that may occur when using higher resolutions.
For this example, select 720p.

Step 8. Generate the Video

Review your settings. Click Generate to start the video creation process. Wait for the generation to complete.

Step 9. Review and Download

Once the video is ready. Preview the generated result. If you are satisfied with the outcome, click Download to save the video to your device. You have now successfully created a video in Higgsfield using an AI-generated image and a motion prompt.`,
  },
];

export function HiggsfieldLessonsPage() {
  useEffect(() => {
    document.title = 'Learn AI | AI Cinema Lab';
  }, []);

  return (
    <main className="higgsfield-page">
      <section className="higgsfield-shell">
        <div className="container">
          <div className="higgsfield-lessons">
            {lessons.map((lesson) => (
              <article className="higgsfield-lesson" key={lesson.youtubeId}>
                <div className="higgsfield-video">
                  <iframe
                    title={lesson.title}
                    src={`https://www.youtube.com/embed/${lesson.youtubeId}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="higgsfield-text">{renderLessonText(lesson.text)}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function renderLessonText(text: string) {
  return text.split('\n').map((line, index) => {
    if (!line.trim()) {
      return <span className="higgsfield-break" key={index} aria-hidden="true" />;
    }

    const isLesson = /^Lesson \d+\./.test(line);
    const isStep = /^Step \d+\./.test(line);
    const className = isLesson || isStep ? 'higgsfield-text-highlight' : undefined;

    return (
      <span className={className} key={index}>
        {line}
      </span>
    );
  });
}
