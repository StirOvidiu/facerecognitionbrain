import React from 'react';
import Particles from 'react-particles-js';
import Clarifai from'clarifai';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';
import 'tachyons';

const app = new Clarifai.App({
 apiKey: '4fc7339439ae4c98ac66ffc5a26029d2'
});

const particlesOption = {
                particles: {
                  number: {
                    value: 30,
                    density: {
                      enable: true,
                      value_area: 150
                    }
                  }
                }
}


const initialState = {
      input:'',
      imageUrl:'',
      box: {}, 
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        password: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
class App extends React.Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        password: data.email,
        email: data.entries,
        entries: data.entries,
        joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  } 

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    const newUser = {...this.state.user};
    newUser.entries = parseInt(newUser.entries) + 1;
    this.setState({imageUrl: this.state.input, user: newUser })
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.input)
    .then(response => {
      if(response) {
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })

      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));  
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

render() {
 const { isSignedIn, imageUrl, route, box } = this.state;
  return (
    <div className="App">
      <Particles className='particles' params={particlesOption}
      />
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
      { route === 'home'
        ? <div>
              <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
               />
              <ImageLinkForm
                onInputChange={this.onInputChange} 
                onButtonSubmit={this.onButtonSubmit}/>
              <FaceRecognition box={box} imageUrl={imageUrl}/>
      </div>
      :(
        route === 'signin' 
        ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>

        )
      }
    </div>
  );
}
} 

export default App;
