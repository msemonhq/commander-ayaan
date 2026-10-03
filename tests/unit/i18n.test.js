import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('i18n and Facts Integrity', () => {
  const stringsPath = path.resolve('www/js/data/strings.en.json');
  const planetsPath = path.resolve('www/js/data/planets.json');

  const strings = JSON.parse(fs.readFileSync(stringsPath, 'utf8'));
  const planets = JSON.parse(fs.readFileSync(planetsPath, 'utf8'));

  test('all required top-level string sections exist', () => {
    const requiredSections = ['app', 'hub', 'meet', 'parade', 'hints', 'praise', 'planet'];
    for (const sec of requiredSections) {
      assert.ok(strings[sec], `Section "${sec}" must exist in strings.en.json`);
    }
  });

  test('at least 6 rotated praise lines exist', () => {
    const praiseKeys = Object.keys(strings.praise);
    assert.ok(praiseKeys.length >= 6, `Expected at least 6 praise lines, got ${praiseKeys.length}`);
  });

  test('all 8 planets plus the Sun have verified facts with <= 12 words', () => {
    const expectedBodies = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    
    for (const bodyId of expectedBodies) {
      const planetEntry = planets.find(p => p.id === bodyId);
      assert.ok(planetEntry, `Planet entry "${bodyId}" must exist in planets.json`);
      assert.ok(planetEntry.facts.length >= 2, `Body "${bodyId}" must have at least 2 facts`);

      for (const fact of planetEntry.facts) {
        assert.equal(fact.verified, true, `Fact ${fact.key} for ${bodyId} must be verified true against NASA Science`);
        assert.ok(fact.source_url.startsWith('https://science.nasa.gov'), `Fact ${fact.key} must link to NASA Science`);

        // Check word count in string definition
        const factParts = fact.text_key.split('.'); // e.g. ["planet", "sun", "fact1"]
        let factText = strings;
        for (const part of factParts) {
          factText = factText?.[part];
        }
        assert.ok(typeof factText === 'string', `Text for ${fact.text_key} must exist`);

        const words = factText.trim().split(/\s+/);
        assert.ok(
          words.length <= 12,
          `Fact "${fact.text_key}" has ${words.length} words (max allowed is 12): "${factText}"`
        );
      }
    }
  });
});
