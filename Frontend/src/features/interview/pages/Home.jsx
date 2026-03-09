import React from 'react'
import '../style/home.scss'

const Home = () => {
  return (
    <div className='home'>
      <div className="interview-input-group">
          <div className="left">
            <label htmlFor="jobDescription">Job description</label>
          <textarea  className='jobDescription' name="" id="jobDescription" placeholder='Enter job Description here....'></textarea>
        </div>
        <div className="right">
          <p>Resume <small className='highlight'>(Use Resume Self Description together For Better result)</small></p>
          <div className="input-group">
            <label className='file-label' htmlFor="resume">Upload Resume</label>
            <input hidden type="file" name='resume' id='resume' accept='.pdf' />
          </div>
          <div className="input-group">
              <label htmlFor="selfDescription">Self Description</label>
              <textarea name="selfDescription" id="selfDescription" placeholder='Describe yourself in Few Sentence....'></textarea>
          </div>
          <button className='button primary-button'>Generate Interview report</button>
        </div>
      </div>
      </div>
  )
}

export default Home;