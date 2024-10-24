'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Trophy, Calculator } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const GRAVITY = 9.81;
const SCALE = 20;

export default function Home() {
  const [velocity, setVelocity] = useState(20);
  const [angle, setAngle] = useState(45);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [time, setTime] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const calculateTrajectory = (t: number) => {
    const angleRad = (angle * Math.PI) / 180;
    const v0x = velocity * Math.cos(angleRad);
    const v0y = velocity * Math.sin(angleRad);

    const x = v0x * t;
    const y = v0y * t - (GRAVITY * t * t) / 2;

    return { x, y };
  };

  const getMaxHeight = () => {
    const angleRad = (angle * Math.PI) / 180;
    const v0y = velocity * Math.sin(angleRad);
    return (v0y * v0y) / (2 * GRAVITY);
  };

  const getRange = () => {
    const angleRad = (angle * Math.PI) / 180;
    return (velocity * velocity * Math.sin(2 * angleRad)) / GRAVITY;
  };

  const getFlightTime = () => {
    const angleRad = (angle * Math.PI) / 180;
    const v0y = velocity * Math.sin(angleRad);
    return (2 * v0y) / GRAVITY;
  };

  const drawScene = (
    ctx: CanvasRenderingContext2D,
    ballPos: { x: number; y: number }
  ) => {
    const canvas = canvasRef.current!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 50);
    ctx.lineTo(canvas.width, canvas.height - 50);
    ctx.strokeStyle = '#333';
    ctx.stroke();

    // Draw player
    ctx.fillStyle = '#666';
    ctx.fillRect(30, canvas.height - 100, 20, 50);

    // Draw ball
    ctx.beginPath();
    ctx.arc(
      50 + ballPos.x * SCALE,
      canvas.height - 50 - ballPos.y * SCALE,
      10,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
  };

  const animate = (startTime: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const currentTime = (Date.now() - startTime) / 1000;
    setTime(currentTime);

    const pos = calculateTrajectory(currentTime);
    setPosition(pos);

    drawScene(ctx!, pos);

    if (pos.y < 0) {
      setIsAnimating(false);
      return;
    }

    animationRef.current = requestAnimationFrame(() => animate(startTime));
  };

  const startAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const startTime = Date.now();
    animate(startTime);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawScene(ctx!, { x: 0, y: 0 });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-6 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Simulador de Movimiento Parabólico
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Velocidad Inicial (m/s): {velocity}
                </label>
                <Slider
                  value={[velocity]}
                  onValueChange={(v) => setVelocity(v[0])}
                  min={0}
                  max={50}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Ángulo (grados): {angle}
                </label>
                <Slider
                  value={[angle]}
                  onValueChange={(v) => setAngle(v[0])}
                  min={0}
                  max={90}
                  step={1}
                />
              </div>

              <Button
                onClick={startAnimation}
                disabled={isAnimating}
                className="w-full"
              >
                ¡Patear Balón!
              </Button>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">Altura Máxima:</p>
                  <p>{getMaxHeight().toFixed(2)} m</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">Alcance:</p>
                  <p>{getRange().toFixed(2)} m</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">Tiempo de Vuelo:</p>
                  <p>{getFlightTime().toFixed(2)} s</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">Tiempo Actual:</p>
                  <p>{time.toFixed(2)} s</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={500}
                height={300}
                className="w-full bg-gradient-to-b from-blue-400 to-blue-600 rounded"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Fórmulas y Explicación
            </h2>
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="formulas">
              <AccordionTrigger>
                Fórmulas del Movimiento Parabólico
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-bold mb-2">
                      Componentes de la Velocidad:
                    </h3>
                    <p>v₀ₓ = v₀ cos(θ)</p>
                    <p>v₀ᵧ = v₀ sin(θ)</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-bold mb-2">Ecuaciones de Posición:</h3>
                    <p>x(t) = v₀ₓt</p>
                    <p>y(t) = v₀ᵧt - ½gt²</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-bold mb-2">Altura Máxima:</h3>
                    <p>h_max = (v₀ᵧ)²/2g</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-bold mb-2">Alcance Máximo:</h3>
                    <p>R = (v₀² sin(2θ))/g</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-bold mb-2">Tiempo de Vuelo:</h3>
                    <p>T = 2v₀ᵧ/g</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="explanation">
              <AccordionTrigger>Explicación Paso a Paso</AccordionTrigger>
              <AccordionContent>
                <ol className="space-y-4 list-decimal list-inside text-sm">
                  <li className="p-3 bg-blue-50 rounded-lg">
                    El movimiento parabólico es la combinación de:
                    <ul className="list-disc list-inside ml-4 mt-2">
                      <li>
                        Movimiento horizontal uniforme (velocidad constante)
                      </li>
                      <li>
                        Movimiento vertical uniformemente acelerado (debido a la
                        gravedad)
                      </li>
                    </ul>
                  </li>
                  <li className="p-3 bg-blue-50 rounded-lg">
                    La velocidad inicial (v₀) se descompone en:
                    <ul className="list-disc list-inside ml-4 mt-2">
                      <li>Componente horizontal: v₀ₓ = v₀ cos(θ)</li>
                      <li>Componente vertical: v₀ᵧ = v₀ sin(θ)</li>
                    </ul>
                  </li>
                  <li className="p-3 bg-blue-50 rounded-lg">
                    En el eje horizontal:
                    <ul className="list-disc list-inside ml-4 mt-2">
                      <li>No hay aceleración</li>
                      <li>La velocidad horizontal permanece constante</li>
                      <li>La posición x aumenta uniformemente</li>
                    </ul>
                  </li>
                  <li className="p-3 bg-blue-50 rounded-lg">
                    En el eje vertical:
                    <ul className="list-disc list-inside ml-4 mt-2">
                      <li>La aceleración es -g (gravedad)</li>
                      <li>La velocidad vertical disminuye con el tiempo</li>
                      <li>La altura y forma una parábola</li>
                    </ul>
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    </div>
  );
}
