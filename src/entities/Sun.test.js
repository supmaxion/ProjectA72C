import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { createSun } from './Sun'

describe('createSun - mély teszt', () => {
	it('Group-ot ad vissza', () => {
		const sun = createSun()
		expect(sun).toBeInstanceOf(THREE.Group)
	})

	it('helyes számú child objektum van', () => {
		const sun = createSun()

		const meshes = sun.children.filter(c => c instanceof THREE.Mesh)
		const lights = sun.children.filter(c => c instanceof THREE.PointLight)

		expect(meshes.length).toBe(2)
		expect(lights.length).toBe(1)
	})

	it('default pozíció helyes', () => {
		const sun = createSun()

		expect(sun.position.x).toBe(-300)
		expect(sun.position.y).toBe(150)
		expect(sun.position.z).toBe(-2000)
	})

	it('light intenzitás létezik', () => {
		const sun = createSun()

		const light = sun.children.find(c => c instanceof THREE.PointLight)

		expect(light.intensity).toBe(2.5)
	})
})