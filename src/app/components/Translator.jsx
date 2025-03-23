"use client";
import { useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import useClipboard from "react-use-clipboard";
import { LuCopy } from "react-icons/lu";
import { FaMicrophone, FaStop } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Toaster, toast } from "sonner";

const Translator = () => {
  // Language state
  const [language, setLanguage] = useState("en");
  const isEnglish = language === "en";

  // Speech and translation states
  const [textToCopy, setTextToCopy] = useState("");
  const [isCopied, setCopied] = useClipboard(textToCopy, {
    successDuration: 1000,
  });
  const [isListening, setIsListening] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Speech recognition hook
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // Language codes
  const fromLang = language === "en" ? "en" : "si";
  const toLang = language === "en" ? "si" : "en";

  // Clear all content when language changes
  useEffect(() => {
    setTranslatedText("");
    setInputText("");
    resetTranscript();
    SpeechRecognition.stopListening();
    setIsListening(false);
  }, [language]);

  // Handle text input changes
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputText(newValue);
    
    // If user deletes all text, clear speech transcript too
    if (newValue === "") {
      resetTranscript();
    }
  };

  // Speech control functions
  const startListening = () => {
    SpeechRecognition.startListening({ 
      continuous: true,
      language: fromLang
    });
    setIsListening(true);
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setIsListening(false);
  };

  // Translation function
  const handleTranslate = async () => {
    setIsLoading(true);
    try {
      const translationText = inputText + transcript;
      if (!translationText.trim()) return;

      const transLINK = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        translationText
      )}&langpair=${fromLang}|${toLang}`;

      const response = await fetch(transLINK);
      const data = await response.json();

      if (data.responseStatus === 200) {
        setTranslatedText(data.responseData.translatedText);
        toast.success("Translation successful");
      }
    } catch (error) {
      toast.error("Translation failed", {
        action: {
          label: "Retry",
          onClick: () => handleTranslate(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update copy text
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.warn("Browser does not support speech recognition.");
      return;
    }
    setTextToCopy(translatedText);
  }, [translatedText, browserSupportsSpeechRecognition]);

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <Toaster position="top-center" richColors />
      
      <Card className="mx-auto max-w-4xl p-6">
        {/* Language Toggle Group */}
        <ToggleGroup 
          type="single" 
          value={language}
          onValueChange={(value) => setLanguage(value)}
          className="mb-6"
        >
          <ToggleGroupItem value="en" aria-label="Toggle English">
            <span className={`text-sm ${isEnglish ? 'font-semibold' : ''}`}>
              English
            </span>
          </ToggleGroupItem>
          <ToggleGroupItem value="si" aria-label="Toggle Sinhala">
            <span className={`text-sm ${!isEnglish ? 'font-semibold' : ''}`}>
              සිංහල
            </span>
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Translation Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <Textarea
            className="h-64 resize-none"
            placeholder={isEnglish ? "Speak or type here..." : "ඇසුරුම් හෝ ටයිප් කරන්න..."}
            value={inputText + transcript}
            onChange={handleInputChange}
            maxLength={5000}
          />

          <div className="relative">
            <Textarea
              className="h-64 resize-none bg-muted"
              placeholder={isEnglish ? "සිංහල පරිවර්තනය..." : "English translation..."}
              value={translatedText}
              readOnly
            />
            {translatedText && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-4 right-4"
                    onClick={setCopied}
                  >
                    <LuCopy className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isCopied ? "Copied!" : "Copy to clipboard"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isLoading && <Progress value={33} className="mt-4" />}

        {/* Control Bar */}
        <div className="mt-8 flex items-center justify-between">
          <Button 
            onClick={handleTranslate}
            disabled={isLoading}
            className="w-32"
          >
            {isLoading ? "Translating..." : (isEnglish ? "Translate" : "පරිවර්තනය")}
          </Button>

          <Button
            variant={isListening ? "destructive" : "outline"}
            onClick={isListening ? stopListening : startListening}
            className="gap-2"
          >
            {isListening ? (
              <>
                <FaStop className="h-5 w-5" />
                <span>{isEnglish ? "Stop" : "නවත්වන්න"}</span>
              </>
            ) : (
              <>
                <FaMicrophone className="h-5 w-5" />
                <span>{isEnglish ? "Listen" : "අසන්න"}</span>
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Translator;