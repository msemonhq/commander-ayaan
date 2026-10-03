/**
 * Scene Manager (js/core/scenes.js).
 * Coordinates scene lifecycle (enter, exit, update, render, pointer events).
 */
import { events } from './events.js';

export class SceneManager {
  constructor(uiOverlayElement) {
    this.uiOverlay = uiOverlayElement;
    this.scenes = new Map();
    this.currentScene = null;
    this.currentSceneName = null;
  }

  register(name, sceneInstance) {
    this.scenes.set(name, sceneInstance);
    sceneInstance.sceneManager = this;
  }

  switch(name, params = {}) {
    if (!this.scenes.has(name)) {
      console.error(`Scene "${name}" not found.`);
      return;
    }

    if (this.currentScene) {
      this.currentScene.exit();
      // Clear DOM UI overlay created by previous scene
      if (this.uiOverlay) {
        this.uiOverlay.innerHTML = '';
      }
    }

    const nextScene = this.scenes.get(name);
    this.currentSceneName = name;
    this.currentScene = nextScene;
    nextScene.enter(params);

    events.emit('scene:changed', { name, params });
  }

  update(dt) {
    if (this.currentScene) {
      this.currentScene.update(dt);
    }
  }

  render(ctx, width, height, alpha) {
    if (this.currentScene) {
      this.currentScene.render(ctx, width, height, alpha);
    }
  }

  handleTap(x, y) {
    if (this.currentScene && this.currentScene.handleTap) {
      return this.currentScene.handleTap(x, y);
    }
    return false;
  }

  handleDrag(x, y, dx, dy) {
    if (this.currentScene && this.currentScene.handleDrag) {
      this.currentScene.handleDrag(x, y, dx, dy);
    }
  }

  handleDragEnd(x, y) {
    if (this.currentScene && this.currentScene.handleDragEnd) {
      this.currentScene.handleDragEnd(x, y);
    }
  }
}
