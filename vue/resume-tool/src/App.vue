<template>
  <div class="page">
    <header>
      <topbar/>
    </header>
    <main>
      <resumeeditor/>
      <resumepreview/>
    </main>
  </div>
</template>

<script>
import './assets/reset.css'
import 'normalize.css/normalize.css'

import topbar from './components/topbar'
import resumeeditor from './components/resumeeditor'
import resumepreview from './components/resumepreview'
import icons from './assets/icons'

export default {
  name: 'app',
  data: function () {
    return {
      text: '你好'
    }
  },
  components: { topbar, resumeeditor, resumepreview },
  created() {
    document.body.insertAdjacentHTML('afterbegin', icons) //
  }
}
</script>

<style lang="scss">
  .page{
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #EAEBEC;

    >main{
      flex-grow: 1;
    }

    >main{
      min-width: 1024px;
      max-width: 1440px;
      display: flex;
      justify-content: space-between;
      padding: 0 16px;
      margin-top: 16px;
      margin-bottom: 16px;
      width: 100%;
      align-self: center;
    }
  }

  #ResumeEditor{
    width: 35%;
    background-color: #444;
  }

  #ResumePreview{
    margin-left: 16px;
    flex-grow: 1;
    background-color: #777;
  }

  svg.icon{
    height: 1em;
    width: 1em;
    fill: currentColor;
    vertical-align: -0.1em;
    font-size:16px;
  }
</style>
