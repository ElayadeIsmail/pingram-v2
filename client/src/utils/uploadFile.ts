// const url = await uploadFile(file,(progress)=> setProgress(progress))

export function uploadFile(
  file: File,
  onProgress: (percentage: number) => void
) {
  return new Promise<string>((res, rej) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', process.env.NEXT_PUBLIC_CLOUDINARY_URL);

    // On success
    xhr.onload = () => {
      const resp = JSON.parse(xhr.responseText);
      console.log(resp);

      res(resp.secure_url);
    };
    // Handle Error
    xhr.onerror = (evt) => rej(evt);

    // handle Progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = (event.loaded / event.total) * 100;
        onProgress(Math.round(percentage));
      }
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_KEY);

    xhr.send(formData);
  });
}
