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

HUKAM.storeImage = (file) => {
  const transaction = HUKAM.db.transaction(['images'], 'readwrite')
  transaction.oncomplete = (event) => {}
  transaction.onerror = (event) => {}

  const objectStore = transaction.objectStore('images')
  const request = objectStore.add({
    id: Date.now(),
    file,
  })
  request.onsuccess = (event) => {
    console.log('Image saved!')
  }
}

// TODO: handle video
HUKAM.updateImageDisplay = async (input) => {
  console.log('updateImageDisplay')
  console.log(input)
  const files = input.target.files || []
  for (const file of files) {
    const src = URL.createObjectURL(file)
    const base64 = await HUKAM.getBase64(file)
    console.log({ src, base64, file })

    HUKAM.appendImage(file, document.getElementById('images'))
    HUKAM.storeImage(file)
  }
}

HUKAM.loadImages = () => {
  console.log('loadImages')
  const transaction = HUKAM.db.transaction(['images'], 'readonly')
  const objectStore = transaction.objectStore('images')
  objectStore.getAll().onsuccess = (event) => {
    console.log('Got all images: ' + event.target.result)
    const images = event.target.result
    images.forEach((image) => {
      HUKAM.appendImage(image.file, document.getElementById('images'))
    })
  }
}

HUKAM.main = () => {
  const request = indexedDB.open('MyTestDatabase')
  request.onerror = (event) => {
    console.log("Why didn't you allow my web app to use IndexedDB?!")
  }
  request.onsuccess = (event) => {
    HUKAM.db = event.target.result
    HUKAM.db.onerror = (event) => {
      // Generic error handler for all errors targeted at this database's
      // requests!
      console.error('Database error: ' + event.target.errorCode)
    }
    HUKAM.loadImages()
    console.log('DB connected')
  }
  request.onupgradeneeded = (event) => {
    // Save the IDBDatabase interface
    HUKAM.db = event.target.result

    // Create an objectStore for this database
    const objectStore = HUKAM.db.createObjectStore('images', { keyPath: 'id' })
    objectStore.transaction.oncomplete = (event) => {
      console.log('objectStore images created')
    }
  }
}
