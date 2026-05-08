import AppKit
import AVFoundation
import CoreVideo
import Foundation

let args = CommandLine.arguments
guard args.count == 7 else {
    fputs("usage: swift encode_frames.swift <frames-dir> <output.mp4> <width> <height> <fps> <frame-count>\n", stderr)
    exit(2)
}

let framesDir = URL(fileURLWithPath: args[1], isDirectory: true)
let outputURL = URL(fileURLWithPath: args[2])
let width = Int(args[3])!
let height = Int(args[4])!
let fps = Int32(args[5])!
let frameCount = Int(args[6])!

if FileManager.default.fileExists(atPath: outputURL.path) {
    try FileManager.default.removeItem(at: outputURL)
}

let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
let outputSettings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
]

let input = AVAssetWriterInput(mediaType: .video, outputSettings: outputSettings)
input.expectsMediaDataInRealTime = false

let sourceAttributes: [String: Any] = [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height,
    kCVPixelBufferCGImageCompatibilityKey as String: true,
    kCVPixelBufferCGBitmapContextCompatibilityKey as String: true,
]

let adaptor = AVAssetWriterInputPixelBufferAdaptor(
    assetWriterInput: input,
    sourcePixelBufferAttributes: sourceAttributes
)

guard writer.canAdd(input) else {
    fputs("cannot add video input\n", stderr)
    exit(1)
}
writer.add(input)

func pixelBuffer(from imageURL: URL) -> CVPixelBuffer? {
    guard let nsImage = NSImage(contentsOf: imageURL) else {
        fputs("could not load \(imageURL.path)\n", stderr)
        return nil
    }
    var proposedRect = CGRect(x: 0, y: 0, width: width, height: height)
    guard let cgImage = nsImage.cgImage(forProposedRect: &proposedRect, context: nil, hints: nil) else {
        fputs("could not create CGImage for \(imageURL.path)\n", stderr)
        return nil
    }

    var buffer: CVPixelBuffer?
    let attrs = sourceAttributes as CFDictionary
    let status = CVPixelBufferCreate(
        kCFAllocatorDefault,
        width,
        height,
        kCVPixelFormatType_32ARGB,
        attrs,
        &buffer
    )
    guard status == kCVReturnSuccess, let pixelBuffer = buffer else {
        fputs("could not create pixel buffer\n", stderr)
        return nil
    }

    CVPixelBufferLockBaseAddress(pixelBuffer, [])
    defer { CVPixelBufferUnlockBaseAddress(pixelBuffer, []) }

    guard
        let context = CGContext(
            data: CVPixelBufferGetBaseAddress(pixelBuffer),
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: CVPixelBufferGetBytesPerRow(pixelBuffer),
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
        )
    else {
        fputs("could not create bitmap context\n", stderr)
        return nil
    }

    context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
    return pixelBuffer
}

guard writer.startWriting() else {
    fputs("writer failed to start: \(writer.error?.localizedDescription ?? "unknown error")\n", stderr)
    exit(1)
}
writer.startSession(atSourceTime: .zero)

for frameIndex in 0..<frameCount {
    autoreleasepool {
        while !input.isReadyForMoreMediaData {
            Thread.sleep(forTimeInterval: 0.002)
        }

        let frameURL = framesDir.appendingPathComponent(String(format: "frame_%04d.png", frameIndex))
        guard let buffer = pixelBuffer(from: frameURL) else {
            exit(1)
        }

        let time = CMTime(value: CMTimeValue(frameIndex), timescale: fps)
        if !adaptor.append(buffer, withPresentationTime: time) {
            fputs("append failed at frame \(frameIndex): \(writer.error?.localizedDescription ?? "unknown error")\n", stderr)
            exit(1)
        }
    }
}

input.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting {
    done.signal()
}
done.wait()

if writer.status != .completed {
    fputs("writer did not complete: \(writer.error?.localizedDescription ?? "unknown error")\n", stderr)
    exit(1)
}
