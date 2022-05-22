HUKAM = window.HUKAM || (() => {
  const Logger = window.HUKAM_LOGGER || class Noop {
    debug() {}
    info() {}
    error() {}
  }
  const logger = new Logger('debug')
  
  const hukam = window.HUKAM || {
    db: null,
  }

  hukam.getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }
  
  hukam.appendImage = (file) => {
    const image = document.createElement('img')
    image.src = URL.createObjectURL(file)
    const parent = document.getElementById('files-container')
    parent.appendChild(image)
  }
  
  hukam.appendVideo = (file) => {
    const video = document.createElement('video')
    video.setAttribute('width', 400)
    video.setAttribute('controls', true)
  
    const source = document.createElement('source')
    source.src = URL.createObjectURL(file)
    source.type = 'video/mp4' // TODO: handle other types
  
    video.appendChild(source)
    const parent = document.getElementById('files-container')
    parent.appendChild(video)
  }
  
  hukam.storeFile = (file) => {
    const transaction = hukam.db.transaction(['files'], 'readwrite')
    transaction.oncomplete = (event) => {}
    transaction.onerror = (event) => {}
  
    const objectStore = transaction.objectStore('files')
    const request = objectStore.add({
      id: Date.now(),
      file,
    })
    request.onsuccess = (event) => {
      logger.debug('File saved!')
    }
  }
  
  hukam.handleSelectFiles = async (input) => {
    logger.debug('handleFilesSelect')
    logger.debug(input)
    const files = input.target.files || []
    for (const file of files) {
      if (file.type.includes('image')) {
        hukam.appendImage(file)
      }
      if (file.type.includes('video')) {
        hukam.appendVideo(file)
      }
      hukam.storeFile(file, file.type)
    }
  }
  
  hukam.loadFiles = () => {
    const transaction = hukam.db.transaction(['files'], 'readonly')
    const objectStore = transaction.objectStore('files')
    objectStore.getAll().onsuccess = (event) => {
      logger.debug({ files: event.target.result })
      const results = event.target.result
      results.forEach((result) => {
        if (result.file.type.includes('image')) {
          hukam.appendImage(result.file)
        }
        if (result.file.type.includes('video')) {
          hukam.appendVideo(result.file)
        }
      })
    }
  }
  
  hukam.main = () => {
    const request = indexedDB.open('hukam-db')
    request.onerror = (event) => {
      logger.error(`IndexedDB error`, event)
    }
    request.onsuccess = (event) => {
      hukam.db = event.target.result
      hukam.db.onerror = (event) => {
        logger.error('database error: ' + event.target.errorCode)
      }
      hukam.loadFiles()
      logger.debug('database connected')
    }
    request.onupgradeneeded = (event) => {
      hukam.db = event.target.result
  
      const imagesObjectStore = hukam.db.createObjectStore('files', {
        keyPath: 'id',
      })
      imagesObjectStore.transaction.oncomplete = (event) => {
        logger.debug('objectStore files created')
      }
    }
  }
  
  return hukam
})()
