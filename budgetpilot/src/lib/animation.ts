export function getMotionConfig() {
  const style = getComputedStyle(document.documentElement)
  return {
    duration:
      parseFloat(style.getPropertyValue('--bp-duration-normal').trim()) / 1000,
    easing: style.getPropertyValue('--bp-easing-spring').trim(),
  }
}
