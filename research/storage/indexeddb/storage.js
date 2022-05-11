HUKAM = window.HUKAM || {
  db: null,
}

HUKAM.getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

HUKAM.appendImage = (file, parent) => {
  const image = document.createElement('img')
  image.src = URL.createObjectURL(file)
  parent.appendChild(image)
}

HUKAM.appendVideo = (file, parent) => {
  const video = document.createElement('video')
  video.setAttribute('width', 400)
  video.setAttribute('controls', true)

  const source = document.createElement('source')
  source.src = URL.createObjectURL(file)
  source.type = 'video/mp4' // TODO: handle other types

  video.appendChild(source)
  parent.appendChild(video)
}

HUKAM.storeFile = (file) => {
  const transaction = HUKAM.db.transaction(['files'], 'readwrite')
  transaction.oncomplete = (event) => {}
  transaction.onerror = (event) => {}

  const objectStore = transaction.objectStore('files')
  const request = objectStore.add({
    id: Date.now(),
    file,
  })
  request.onsuccess = (event) => {
    console.log('File saved!')
  }
}

HUKAM.handleSelectFiles = async (input) => {
  console.log('handleFilesSelect')
  console.log(input)
  const files = input.target.files || []
  for (const file of files) {
    if (file.type.contains('image')) {
      HUKAM.appendImage(file, document.getElementById('files-container'))
    }
    if (file.type.contains('video')) {
      HUKAM.appendVideo(file, document.getElementById('files-container'))
    }
    HUKAM.storeFile(file, file.type)
  }
}

HUKAM.loadFiles = () => {
  const transaction = HUKAM.db.transaction(['files '], 'readonly')
  const objectStore = transaction.objectStore('files')
  objectStore.getAll().onsuccess = (event) => {
    console.log({ files: event.target.result })
    const files = event.target.result
    files.forEach((file) => {
      if (file.type.contains('image')) {
        HUKAM.appendImage(
          image.file,
          document.getElementById('files-container')
        )
      }
      if (file.type.contains('video')) {
        HUKAM.appendVideo(
          image.file,
          document.getElementById('files-container')
        )
      }
    })
  }
}

HUKAM.main = () => {
  const request = indexedDB.open('hukam-db')
  request.onerror = (event) => {
    console.log("Why didn't you allow my web app to use IndexedDB?!")
  }
  request.onsuccess = (event) => {
    HUKAM.db = event.target.result
    HUKAM.db.onerror = (event) => {
      console.error('Database error: ' + event.target.errorCode)
    }
    HUKAM.loadImages()
    console.log('DB connected')
  }
  request.onupgradeneeded = (event) => {
    HUKAM.db = event.target.result

    const imagesObjectStore = HUKAM.db.createObjectStore('files', {
      keyPath: 'id',
    })
    imagesObjectStore.transaction.oncomplete = (event) => {
      console.log('objectStore files created')
    }
  }
}
