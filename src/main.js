const bucket = new WeakMap()

const data = {
  name: 'cong',
  age: 29
}

function track(target, prop) {
  if (!activeEffect) return;

  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }

  let deps = depsMap.get(prop);
  if (!deps) {
    depsMap.set(prop, (deps = new Set()));
  }

  // 收集与副作用函数相关的依赖
  activeEffect.deps.push(deps);

  deps.add(activeEffect);
}

function trigger(target, prop) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(prop);
  if (!effects) return;

  const effectsToRun = new Set(effects); // 直接遍历 effects 会出现死循环
  effectsToRun.forEach((fn) => {
    // 防止在一个副作用函数中同时出现对同一个属性的“读”和“写”操作时出现的无限嵌套问题
    if (fn !== activeEffect) {
      fn();
    }
  });
}

const refData = new Proxy(data, {
  get(target, prop) {
    track(target, prop);

    return target[prop];
  },
  set(target, prop, value) {
    target[prop] = value;

    trigger(target, prop);

    return true;
  },
});

// 把某个副作用函数从与它相关的依赖集合中移除
function cleanup(effectFn) {
  const deps = effectFn.deps;

  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effectFn);
  }

  effectFn.deps.length = 0;
}

let activeEffect;
let effectStack = [];
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn);

    effectStack.push(effectFn);
    activeEffect = effectFn;

    fn();

    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  };

  // 用 deps 收集与该副作用函数相关的依赖
  effectFn.deps = [];

  effect.stack = effect.stack || [];
  effectFn();
}

function sayHello() {
  refData.age++;
}

effect(sayHello);