import * as tf from "@tensorflow/tfjs";

// Vocabulary class to handle word tokenization
export class Vocabulary {
  word2idx: Record<string, number> = {};
  idx2word: Record<number, string> = {};
  vocabSize: number = 0;
  specialTokens = {
    PAD: "<PAD>",
    UNK: "<UNK>",
    START: "<START>",
    END: "<END>",
  };

  constructor() {
    // Initialize special tokens
    this.addWord(this.specialTokens.PAD);
    this.addWord(this.specialTokens.UNK);
    this.addWord(this.specialTokens.START);
    this.addWord(this.specialTokens.END);
  }

  addWord(word: string) {
    console.log(word);
    if (!this.word2idx[word]) {
      this.word2idx[word] = this.vocabSize;
      this.idx2word[this.vocabSize] = word;
      this.vocabSize++;
    }
  }

  buildVocabulary(tweets: string[]) {
    tweets.forEach((tweet) => {
      const words = tweet.toLowerCase().split(/\s+/);
      words.forEach((word) => this.addWord(word));
    });
    console.log(`Vocabulary built with ${this.vocabSize} words`);
  }

  tokenize(text: string) {
    return text
      .toLowerCase()
      .split(/\s+/)
      .map((word) =>
        this.word2idx[word] !== undefined
          ? this.word2idx[word]
          : this.word2idx[this.specialTokens.UNK],
      );
  }

  detokenize(indices: number[]) {
    return indices
      .map((idx) => this.idx2word[idx] || this.specialTokens.UNK)
      .join(" ");
  }
}

type TweetGeneratorConfig = {
  embeddingDim: number;
  hiddenUnits: number;
  vocabSize: number;
  maxLength: number;
  temperature: number;
};

// TweetGenerator class
export class TweetGenerator {
  config: TweetGeneratorConfig;
  vocabulary = new Vocabulary();
  model: tf.Sequential | null = null;

  constructor(config: Partial<TweetGeneratorConfig> = {}) {
    this.config = {
      embeddingDim: config.embeddingDim || 128,
      hiddenUnits: config.hiddenUnits || 256,
      vocabSize: 0,
      maxLength: config.maxLength || 50,
      temperature: config.temperature || 1.0,
      ...config,
    };
  }

  async preprocessData(tweets: string[]) {
    // Build vocabulary
    this.vocabulary.buildVocabulary(tweets);
    this.config.vocabSize = this.vocabulary.vocabSize;

    // Create sequences
    const sequences: {
      input: number[];
      target: number;
    }[] = [];

    tweets.forEach((tweet) => {
      const tokens = [
        this.vocabulary.word2idx[this.vocabulary.specialTokens.START],
        ...this.vocabulary.tokenize(tweet),
        this.vocabulary.word2idx[this.vocabulary.specialTokens.END],
      ];
      console.log(tweet, tokens);
      // Create input/output pairs
      for (let i = 0; i < tokens.length - 1; i++) {
        const inputSeq = tokens.slice(0, i + 1);
        const targetToken = tokens[i + 1];

        // Pad sequence to maxLength
        while (inputSeq.length < this.config.maxLength) {
          inputSeq.unshift(
            this.vocabulary.word2idx[this.vocabulary.specialTokens.PAD],
          );
        }

        // If sequence is too long, truncate
        if (inputSeq.length > this.config.maxLength) {
          inputSeq.splice(0, inputSeq.length - this.config.maxLength);
        }

        sequences.push({
          input: inputSeq,
          target: targetToken,
        });
      }
    });

    // Convert to tensors
    const inputs = tf.tensor2d(
      sequences.map((seq) => seq.input),
      [sequences.length, this.config.maxLength],
    );

    const targets = tf.oneHot(
      tf.tensor1d(
        sequences.map((seq) => seq.target),
        "int32",
      ),
      this.config.vocabSize,
    );

    return { inputs, targets };
  }

  buildModel() {
    this.model = tf.sequential();

    // Embedding layer
    this.model?.add(
      tf.layers.embedding({
        inputDim: this.config.vocabSize,
        outputDim: this.config.embeddingDim,
        inputLength: this.config.maxLength,
      }),
    );

    // LSTM layer
    this.model.add(
      tf.layers.lstm({
        units: this.config.hiddenUnits,
        returnSequences: false,
      }),
    );

    // Output layer
    this.model.add(
      tf.layers.dense({
        units: this.config.vocabSize,
        activation: "softmax",
      }),
    );

    // Compile model
    this.model.compile({
      optimizer: "adam",
      loss: "categoricalCrossentropy",
    });

    console.log("Model built successfully");
    this.model.summary();

    return this.model;
  }

  async train(tweets: string[], epochs = 50, batchSize = 64) {
    console.log("Preprocessing data...");
    const { inputs, targets } = await this.preprocessData(tweets);

    if (!this.model) {
      this.buildModel();
    }

    console.log("Training model...");
    return this.model!.fit(inputs, targets, {
      epochs,
      batchSize,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1} - loss: ${logs?.loss.toFixed(4)}`);
        },
      },
    });
  }

  async generate(seedText = "", maxTokens = 30) {
    if (!this.model) {
      throw new Error("Model not trained yet");
    }

    // Always start with START token, then add seed text tokens if provided
    let currentInput: number[] = [
      this.vocabulary.word2idx[this.vocabulary.specialTokens.START],
    ];

    // Add seed text to influence generation but don't include in result
    if (seedText) {
      currentInput = currentInput.concat(this.vocabulary.tokenize(seedText));
    }

    let result = [];
    let temperature = this.config.temperature;

    const padInput = () => {
      const paddedInput = [...currentInput];

      // Pad to maxLength
      while (paddedInput.length < this.config.maxLength) {
        paddedInput.unshift(
          this.vocabulary.word2idx[this.vocabulary.specialTokens.PAD],
        );
      }

      // Truncate if needed
      if (paddedInput.length > this.config.maxLength) {
        paddedInput.splice(0, paddedInput.length - this.config.maxLength);
      }

      return paddedInput;
    };

    // Generate text token by token
    for (let i = 0; i < maxTokens; i++) {
      const paddedInput = padInput();

      // Predict the next token
      const inputTensor = tf.tensor2d(
        [paddedInput],
        [1, this.config.maxLength],
      );
      const prediction = this.model.predict(inputTensor) as tf.Tensor;

      // Apply temperature for randomness
      const logits = tf.div(prediction.log(), temperature);
      const probabilities = tf.exp(logits).div(tf.sum(tf.exp(logits)));

      // Sample from the distribution
      const nextTokenIdx = this.sampleFromDistribution(
        probabilities.dataSync(),
      );

      // Stop if END token is predicted
      if (
        nextTokenIdx ===
        this.vocabulary.word2idx[this.vocabulary.specialTokens.END]
      ) {
        break;
      }

      // Add the predicted token
      const nextWord = this.vocabulary.idx2word[nextTokenIdx];
      result.push(nextWord);
      currentInput.push(nextTokenIdx);

      // Clean up tensors
      tf.dispose([inputTensor, prediction, logits, probabilities]);
    }

    // Remove special tokens and join
    return result
      .filter(
        (token) =>
          ![
            this.vocabulary.specialTokens.PAD,
            this.vocabulary.specialTokens.START,
            this.vocabulary.specialTokens.END,
            this.vocabulary.specialTokens.UNK,
          ].includes(token),
      )
      .join(" ");
  }

  sampleFromDistribution(
    probabilities: Float32Array | Int32Array | Uint8Array,
  ) {
    const probabilitiesArray = Array.from(probabilities);
    const sum = probabilitiesArray.reduce((a: number, b: number) => a + b, 0);
    console.log("probabilities", sum);
    const normalized = probabilities.map((p) => p / sum);

    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < normalized.length; i++) {
      cumulative += normalized[i];
      if (random < cumulative) {
        return i;
      }
    }

    return normalized.length - 1;
  }

  async saveModel(path: string) {
    if (!this.model) {
      throw new Error("No model to save");
    }
    await this.model.save(`localstorage://${path}`);

    // Save vocabulary separately (as JSON)
    const vocabData = {
      word2idx: this.vocabulary.word2idx,
      idx2word: this.vocabulary.idx2word,
      vocabSize: this.vocabulary.vocabSize,
      specialTokens: this.vocabulary.specialTokens,
    };

    localStorage.setItem(`${path}_vocab`, JSON.stringify(vocabData));
    console.log(`Model saved to localstorage://${path}`);
  }

  async loadModel(path: string) {
    try {
      // Load model
      this.model = (await tf.loadLayersModel(
        `localstorage://${path}`,
      )) as tf.Sequential;
      console.log("Model loaded successfully");

      // Load vocabulary
      const vocabData = JSON.parse(
        localStorage.getItem(`${path}_vocab`) as string,
      );
      this.vocabulary.word2idx = vocabData.word2idx;
      this.vocabulary.idx2word = vocabData.idx2word;
      this.vocabulary.vocabSize = vocabData.vocab_size;
      this.vocabulary.specialTokens = vocabData.special_tokens;

      // Update config
      this.config.vocabSize = this.vocabulary.vocabSize;

      return true;
    } catch (error) {
      console.error("Error loading model:", error);
      return false;
    }
  }
}
