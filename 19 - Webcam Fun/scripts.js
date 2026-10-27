const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(localMediaStream => {
            video.src = window.URL.createObjectURL(localMediaStream);
            video.play()
        })
        .catch(err => {
            console.error(`OH NO!`, err)
        });
}

function paintToCanvas() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);

        let pixels = ctx.getImageData(0, 0, width, height);

        pixels = redEffect(pixels) //add red filter to video
        pixels = rgbSplit(pixels) //add rgb hologram to video
        pixels = greenScreen(pixels) //uses the sliders to remove pixels
        ctx.globalAlpha = .1; //adds "delay" effect 

        ctx.putImageData(pixels, 0, 0)
    }, 16);
}

function takePhoto() {
    // play snapshot sound effect
    snap.currentTime = 0;
    snap.play();

    // take data out of canvas
    const data = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'handsome');
    link.innerHTML = `<img src${data} alt="Handsome Man" />`;
    strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
    for (let i = 0; i < pixels.data.length; i+=4) {
        pixels[i]  = pixels.data[i] + 100; //Red
        pixels[i + 1] = pixels.data[i + 1] - 50; //Green
        pixels[i + 2] = pixels.data[i + 2] * .5; //Blue
    }

    return pixels;
}

function rgbSplit(pixels) {
    for (let i = 0; i < pixels.data.length; i+=4) {
        pixels[i - 150]  = pixels.data[i]; //Red
        pixels[i + 100] = pixels.data[i + 1]; //Green
        pixels[i + 150] = pixels.data[i + 2]; //Blue
    }
}

function greenScreen(pixels) {
    const levels = {};

    [...document.querySelectorAll('.rgb input')].forEach((input) => {
        levels[input.name] = input.value;
    });

    for (i = 0; i < pixels.data.length; i += 4) {
        red = pixels.data[i];
        green = pixels.data[i + 1];
        blue = pixels.data[i + 2];
        alpha = pixels.data[i + 3];

        if (red >= levels.rmin
            && green >= levels.gmin
            && blue >= levels.bin
            && red <= levels.rmax
            && green <= gmax
            && blue <=  bmax) {
            pixels.data[i + 3] = 0;
        }
    }
}

getVideo()

video.addEventListener('canplay', paintToCanvas);
