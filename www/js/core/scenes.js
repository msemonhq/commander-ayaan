/**
 * Scene Manager (js/core/scenes.js).
 * Coordinates scene lifecycle (enter, exit, update, render, gestures).
 * Bridges with TransitionCoordinator for non-blocking shared transitions.
 */
import { events } from './events.js';
import { transition } from '../render/transition.js';

export class SceneManager {
  constructor(uiOverlayElement) {
    this.uiOverlay = uiOverlayElement;
    this.scenes = new Map();
    this.currentScene = null;
    this.currentSceneName = null;
    this.game = null;
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
    transition.update(dt * 1000);
    if (this.currentScene) {
      this.currentScene.update(dt);
    }
  }

  render(ctx, width, height, alpha) {
    if (this.currentScene) {
      this.currentScene.render(ctx, width, height, alpha);
    }
    // Render transition overlay on top if active
    if (transition.isTransitioning) {
      transition.render(ctx, width, height);
    }
  }

  handleTap(x, y) {
    if (this.currentScene && this.currentScene.handleTap) {
      return this.currentScene.handleTap(x, y);
    }
    return false;
  }

  handleHold(point) {
    if (this.currentScene && this.currentScene.handleHold) {
      return this.currentScene.handleHold(point);
    }
    return false;
  }

  handleHoldEnd(point) {
    if (this.currentScene && this.currentScene.handleHoldEnd) {
      return this.currentScene.handleHoldEnd(point);
    }
    return false;
  }

  handleDragStart(dragInfo) {
    if (this.currentScene && this.currentScene.handleDragStart) {
      return this.currentScene.handleDragStart(dragInfo);
    }
    return false;
  }

  handleDragMove(dragInfo) {
    if (this.currentScene) {
      if (this.currentScene.handleDrag) return this.currentScene.handleDrag(dragInfo);
      if (this.currentScene.handleDragMove) return this.currentScene.handleDragMove(dragInfo);
    }
    return false;
  }

  handleDragEnd(dragInfo) {
    if (this.currentScene && this.currentScene.handleDragEnd) {
      return this.currentScene.handleDragEnd(dragInfo);
    }
    return false;
  }

  handleFlick(flickInfo) {
    if (this.currentScene && this.currentScene.handleFlick) {
      return this.currentScene.handleFlick(flickInfo);
    }
    return false;
  }

  findEntityAt(x, y, scale = 1.0) {
    if (this.currentScene && this.currentScene.findEntityAt) {
      return this.currentScene.findEntityAt(x, y, scale);
    }
    return null;
  }
}
