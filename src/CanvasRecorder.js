import { saveAs } from "file-saver";

export default class CanvasRecorder {
    constructor(canvas, gui, filename, recorder) {
        this.canvas = canvas
        this.gui = gui
        this.filename = filename;
        this.recorder = recorder
        this.framerate = 24;
        this.recording = [];
        this.mediaRecorder = null;
        this.options = {
            // videoBitsPerSecond: 20000000,
            // mimeType: 'video/mp4'
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 30000000
            // mimeType: 'video/mp4; codecs=avc1.42E01E'
            // mimeType: 'video/webm;codecs=h264,vp9,opus' compatible chrome not safari
            // mimeType: 'video/webm;codecs=avc1'
        }

        this.gui.add({ startRecording: () => { this.startRecording() } }, "startRecording").name('start recording')
        this.gui.add({ stopRecording: () => { this.stopAndSaveRecording() } }, "stopRecording").name('stop recording')

    }

    startRecording() {
        this.stream = this.canvas.captureStream(this.framerate)
        this.recorder.start()
        console.log(this.recorder)
        this.stream.addTrack(this.recorder._recorder.stream.getTracks()[0])
        this.mediaRecorder = new MediaRecorder(this.stream, this.options);
        this.mediaRecorder.ondataavailable = this.onDataAvailable.bind(this);
        this.mediaRecorder.onerror = this.onError.bind(this);
        this.mediaRecorder.onstart = this.onStart.bind(this)
        this.mediaRecorder.start();
    }

    onDataAvailable(event) {
        console.log("data-available");
        if (event.data.size > 0) {
            this.recording.push(event.data);
            console.log(this.recording);
            const blob = new Blob(this.recording, {
                type: "video/mp4"
            })
            saveAs(blob, this.filename)
            this.stream = null
            this.recording = []
            this.mediaRecorder = null
        } else {
            console.log("nope nothing");
        }
    }

    onError(event) {
        console.log(event)
    }

    onStart(event) {
        console.log("Started recording...")
    }


    stopAndSaveRecording() {
        console.log("Stopping recording...");
        this.mediaRecorder.stop()
        this.recorder.stop()
        this.stream.getTracks().forEach(track => track.stop())
    }
}